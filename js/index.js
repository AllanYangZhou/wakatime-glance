var wakatimeGlance = angular.module('wakatimeGlance', ['ngMaterial']);

wakatimeGlance.controller('PopupController', ['$http', function($http) {
  var popup = this;
  var WAKATIME_API_PREFIX = 'https://wakatime.com/api/v1/';

  // Converts seconds to String with format: 'X hrs Y min.'
  var secondsToHoursAndMinutes = function(seconds) {
    var hours = _.floor(seconds / 3600);
    var minutes = _.floor((seconds % 3600) / 60);
    return _.join([String(hours), 'hrs', String(minutes), 'min'], ' ');
  };

  // Format Date object into MM/DD/YYYY format for WakaTime API.
  var formatDate = function(date) {
    return _.join([
      date.getMonth() + 1,
      date.getDate(),
      date.getFullYear()
    ], '/');
  };

  var getStatistics = function(startDate, endDate, callback) {
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
    specifiedDate.setDate(specifiedDate.getDate() - 1);
    var formattedDate = formatDate(specifiedDate);
    popup.humanReadableDate = formattedDate;
    getStatistics(formattedDate, formattedDate, function(result) {
      popup.specifiedStat = result;
    });
  };

  // Increase specifiedDate by one day, and update stats.
  popup.incrementDate = function() {
    specifiedDate.setDate(specifiedDate.getDate() + 1);
    var formattedDate = formatDate(specifiedDate);
    popup.humanReadableDate = formattedDate;
    getStatistics(formattedDate, formattedDate, function(result) {
      popup.specifiedStat = result;
    });
  };

  // Checks whether specifiedDate is the current date.
  popup.isDateCurrent = function() {
    var now = new Date();
    return (now.getFullYear() === specifiedDate.getFullYear()) &&
      (now.getMonth() === specifiedDate.getMonth()) &&
      (now.getDate() === specifiedDate.getDate());
  };

  // The single date which we are displaying stats for.
  var specifiedDate = new Date();

  popup.humanReadableDate = ''; // Human readable version of specifiedDate.
  popup.specifiedStat = ''; // The statistics for specifiedDate.
  popup.sevenDayStat = ''; // The statistics for the last seven days.

  popup.isLoggedIn = true;

  // Initialize stats.
  var nowFormatted = formatDate(new Date());
  popup.humanReadableDate = nowFormatted;
  getStatistics(nowFormatted, nowFormatted, function(result){
    popup.specifiedStat = result;
  });

  var sixDaysAgo = new Date();
  sixDaysAgo.setDate(sixDaysAgo.getDate() - 6);
  getStatistics(
    formatDate(sixDaysAgo), formatDate(new Date()), function(result) {
      popup.sevenDayStat = result;
    }
  );
}]);
