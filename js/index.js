var wakatimeGlance = angular.module('wakatimeGlance', ['ngMaterial']);

wakatimeGlance.controller('PopupController', [
  '$http', function($http) {
    var popup = this;
    var WAKATIME_API_PREFIX = 'https://wakatime.com/api/v1/';

    // Converts seconds to String with format: 'X hrs Y min.'
    var secondsToHoursAndMinutes = function(seconds) {
      var hours = _.floor(seconds / 3600);
      var minutes = _.floor((seconds % 3600) / 60);
      return (hours > 0 ? String(hours) + ' hrs ' : '') +
        String(minutes) + ' min';
    };

    // Format Date object into MM/DD/YYYY format for WakaTime API.
    var formatMonthDayYear = function(date) {
      return _.join([
        date.getMonth() + 1,
        date.getDate(),
        date.getFullYear()
      ], '/');
    };

    // Fetch summary for date range from WakaTime api, then call callback.
    var getSummary = function(startDate, endDate, callback) {
      var requestFormatted = WAKATIME_API_PREFIX +
        'users/current/summaries?start=' + startDate + '&end=' + endDate;
      $http.get(requestFormatted).then(function(response) {
        callback(response.data.data);
      }, function(err) {
        console.log(err);
        if (err.status === 401) {
          popup.isLoggedIn = false;
        } else if (err.status === -1) {
          console.log('No longer connected');
          popup.isConnected = false;
        }
      });
    };

    // Returns formatted project totals for a given summary
    // (data returned from API). Returns a list.
    var getProjectTotalsFromSummary = function(summary) {
      return _.map(
        _.groupBy(_.flatten(_.map(summary, 'projects')), 'name'),
        function(val, name) {
          return {
            name: name,
            time: secondsToHoursAndMinutes(_.sumBy(val, 'total_seconds'))
          };
        }
      );
    };

    // Returns list of totals for each day in the summary (data returned from
    // API).
    var getDailyTotalsFromSummary = function(summary) {
      var now = new Date();
      return _.map(summary, function(val, index) {
        var date = new Date();
        date.setDate(now.getDate() - 6 + index);
        return {
          date: date,
          time: secondsToHoursAndMinutes(val.grand_total.total_seconds),
          dayBreakdown: _.map(val.projects, function(proj) {
            return {
              name: proj.name,
              time: secondsToHoursAndMinutes(proj.total_seconds)
            };
          })
        };
      });
    };

    // Returns formatted total (a string) for a given summary
    // (data returned from API).
    var getWeekTotalFromSummary = function(summary) {
      return secondsToHoursAndMinutes(_.sumBy(summary, function(o) {
        return o.grand_total.total_seconds;
      }));
    };

    // Returns formatted average (a string) for a given summary.
    var getWeekAverageFromSummary = function(summary) {
      return secondsToHoursAndMinutes(_.floor(_.sumBy(summary, function(o) {
        return o.grand_total.total_seconds;
      }) / 7));
    };

    // Converts date into human readable format.
    popup.formatDate = function(date) {
      return formatMonthDayYear(date);
    };

    popup.showDetails = function(index) {
      popup.activeDay = popup.dailyTotals[6 - index];
    };

    popup.showSevenDayDetails = function() {
      popup.sevenDayDetails = projectTotals;
    };

    popup.closeDetails = function() {
      popup.activeDay = null;
    };

    popup.closeSevenDayDetails = function() {
      popup.sevenDayDetails = null;
    };

    popup.todayTotal = '';
    popup.dailyTotals = [];
    popup.sevenDayTotal = '';
    popup.sevenDayAverage = '';
    popup.sevenDayDetails = null;
    popup.isLoggedIn = true;
    popup.isConnected = true;
    popup.activeDay = null;

    var projectTotals = [];
    var init = function() {
      var now = formatMonthDayYear(new Date());
      var d = new Date();
      d.setDate(d.getDate() - 6);
      var sixDaysAgo = formatMonthDayYear(d);
      getSummary(sixDaysAgo, now, function(summary) {
        popup.dailyTotals = getDailyTotalsFromSummary(summary);
        popup.todayTotal = popup.dailyTotals[6].time;
        popup.sevenDayTotal = getWeekTotalFromSummary(summary);
        popup.sevenDayAverage = getWeekAverageFromSummary(summary);
        projectTotals = getProjectTotalsFromSummary(summary);
      });
    };

    init(); // Initialize everything.
  }
]);
