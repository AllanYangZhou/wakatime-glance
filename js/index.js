var wakatimeGlance = angular.module('wakatimeGlance', ['ngMaterial']);

wakatimeGlance.controller('PopupController', ['$http', function($http) {
  var popup = this;
  var WAKATIME_API_PREFIX = 'https://wakatime.com/api/v1/';

  var formatDate = function(numDays) {
    var now = new Date();
    var date = new Date(now.getTime() - (numDays * 24 * 60 * 60 * 1000));
    return _.join([
      date.getMonth() + 1,
      date.getDate(),
      date.getFullYear()
    ], '/');
  };

  var formatSummaryRequest = function(startDay, endDay) {
    return WAKATIME_API_PREFIX + 'users/current/summaries?start=' +
      formatDate(startDay) + '&end=' + formatDate(endDay);
  };

  var setData = function(startDay, endDay) {
    $http.get(formatSummaryRequest(startDay, endDay)).then(function(response) {
      popup.data = response.data.data[0].grand_total.text;
    }, function(err) {
      console.log(err);
    });
  }

  setData(0, 0);

  popup.date = formatDate(0);
  popup.data = 'Loading...';
}]);
