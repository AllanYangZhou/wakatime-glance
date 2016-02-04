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

    // Returns formatted total (a stinrg) for a given summary
    // (data returned from API).
    var getTotalsFromSummary = function(summary) {
      return secondsToHoursAndMinutes(_.sumBy(summary, function(o) {
        return o.grand_total.total_seconds;
      }));
    };

    // Decrease specifiedDate by one day, and update stats.
    popup.decrementDate = function() {
      popup.specifiedDate.setDate(popup.specifiedDate.getDate() - 1);
      var formattedDate = formatMonthDayYear(popup.specifiedDate);
      popup.specifiedDateTotal = '';
      getSummary(formattedDate, formattedDate, function(summary) {
        popup.specifiedDateTotal = getTotalsFromSummary(summary);
      });
    };

    // Increase specifiedDate by one day, and update stats.
    popup.incrementDate = function() {
      popup.specifiedDate.setDate(popup.specifiedDate.getDate() + 1);
      var formattedDate = formatMonthDayYear(popup.specifiedDate);
      popup.specifiedDateTotal = '';
      getSummary(formattedDate, formattedDate, function(summary) {
        popup.specifiedDateTotal = getTotalsFromSummary(summary);
      });
    };

    // Checks whether specifiedDate is the current date.
    popup.isDateCurrent = function() {
      var now = new Date();
      return (now.getFullYear() === popup.specifiedDate.getFullYear()) &&
        (now.getMonth() === popup.specifiedDate.getMonth()) &&
        (now.getDate() === popup.specifiedDate.getDate());
    };

    // Converts date into human readable format.
    popup.formatDate = function(date) {
      return formatMonthDayYear(date);
    };

    // The single date for which we are displaying stats.
    popup.specifiedDate = new Date();
    popup.specifiedDateTotal = '';
    popup.sevenDayTotal = '';
    popup.isLoggedIn = true;
    popup.projectTotals = [];

    var init = function() {
      var now = formatMonthDayYear(new Date());
      getSummary(now, now, function(summary){
        popup.specifiedDateTotal = getTotalsFromSummary(summary);
      });

      var d = new Date();
      d.setDate(d.getDate() - 6);
      var sixDaysAgo = formatMonthDayYear(d);
      getSummary(sixDaysAgo, now, function(summary) {
        popup.sevenDayTotal = getTotalsFromSummary(summary);
        popup.projectTotals = getProjectTotalsFromSummary(summary);
      });
    };

    init(); // Initialize everything.
  }
]);
