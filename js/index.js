var wakatimeGlance = angular.module('wakatimeGlance', ['ngMaterial']);

wakatimeGlance.controller('PopupController', ['$http', function($http) {
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

  // Fetch total seconds for specified date range, applies callback to result.
  var getTotalSecondsForRange = function(startDate, endDate, callback) {
    var requestFormatted = WAKATIME_API_PREFIX +
      'users/current/summaries?start=' + startDate + '&end=' + endDate;
    $http.get(requestFormatted).then(function(response) {
      var result = secondsToHoursAndMinutes(
        _.sumBy(response.data.data, function(o) {
          return o.grand_total.total_seconds
        })
      );
      callback(result);
    }, function(err) {
      console.log(err);
      // 401 -> Assume not logged in.
      if (err.status === 401) {
        popup.isLoggedIn = false;
      }
    });
  };

  // Decrease specifiedDate by one day, and update stats.
  popup.decrementDate = function() {
    popup.specifiedDate.setDate(popup.specifiedDate.getDate() - 1);
    var formattedDate = formatMonthDayYear(popup.specifiedDate);
    popup.specifiedDateTotal = '';
    getTotalSecondsForRange(formattedDate, formattedDate, function(result) {
      popup.specifiedDateTotal = result;
    });
  };

  // Increase specifiedDate by one day, and update stats.
  popup.incrementDate = function() {
    popup.specifiedDate.setDate(popup.specifiedDate.getDate() + 1);
    var formattedDate = formatMonthDayYear(popup.specifiedDate);
    popup.specifiedDateTotal = '';
    getTotalSecondsForRange(formattedDate, formattedDate, function(result) {
      popup.specifiedDateTotal = result;
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

  // Initialize stats.
  var now = formatMonthDayYear(new Date());
  getTotalSecondsForRange(now, now, function(result){
    popup.specifiedDateTotal = result;
  });

  var sixDaysAgo = new Date();
  sixDaysAgo.setDate(sixDaysAgo.getDate() - 6);
  getTotalSecondsForRange(
    formatMonthDayYear(sixDaysAgo), formatMonthDayYear(new Date()), function(result) {
      popup.sevenDayTotal = result;
    }
  );
}]);
