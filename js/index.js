var wakatimeGlance = angular.module('wakatimeGlance', ['ngMaterial']);

wakatimeGlance.controller('PopupController', ['$http', function($http) {
  var popup = this;
  var WAKATIME_API_PREFIX = 'https://wakatime.com/api/v1/';

  // Format Date object into MM/DD/YYYY format for WakaTime API.
  var formatDate = function(date) {
    return _.join([
      date.getMonth() + 1,
      date.getDate(),
      date.getFullYear()
    ], '/');
  };

  // Grab the statistics for a date and update the view.
  var setStats = function(date) {
    var dateFormatted = formatDate(date);
    popup.humanReadableDate = dateFormatted;
    popup.stats = '';
    var requestFormatted = WAKATIME_API_PREFIX +
      'users/current/summaries?start=' + dateFormatted +
      '&end=' + dateFormatted;
    $http.get(requestFormatted).then(function(response) {
      popup.stats = response.data.data[0].grand_total.text;
    }, function(err) {
      console.log(err);
    });
  };

  // The date which we are displaying stats for.
  var specifiedDate = new Date();

  popup.humanReadableDate = ''; // Human readable version of specifiedDate.
  popup.stats = ''; // The actual statistics

  // Decrease specifiedDate by one day, and update stats.
  popup.decrementDate = function() {
    specifiedDate.setDate(specifiedDate.getDate() - 1);
    setStats(specifiedDate);
  };

  // Increase specifiedDate by one day, and update stats.
  popup.incrementDate = function() {
    specifiedDate.setDate(specifiedDate.getDate() + 1);
    setStats(specifiedDate);
  };

  // Checks whether specifiedDate is the current date.
  popup.isDateCurrent = function() {
    var now = new Date();
    return (now.getFullYear() === specifiedDate.getFullYear()) &&
      (now.getMonth() === specifiedDate.getMonth()) &&
      (now.getDate() === specifiedDate.getDate());
  };

  // Initialize stats.
  setStats(specifiedDate);
}]);
