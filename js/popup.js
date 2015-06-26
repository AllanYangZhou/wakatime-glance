document.addEventListener('DOMContentLoaded', function() {
  var prefix = 'https:/wakatime.com/api/v1/';

  // format dates for requests
  var now = new Date();
  var dateFormatted = (now.getMonth() + 1)
    + '/' + now.getDate() + '/' + now.getFullYear();
  var dayParams = 'users/current/summaries?start='
    + dateFormatted + '&end=' + dateFormatted;
  var weekParams = 'users/current/stats/last_7_days';
  // make AJAX calls for day and week data, save promises
  var dayReq = $.get(prefix + dayParams);
  var weekReq = $.get(prefix + weekParams);

  $.when(dayReq, weekReq)
    // if both promises are successful
    // display the data
    .done(function(dayRes, weekRes) {
      $("<p>Today: " + dayRes[0].data[0].grand_total.text + "</p>")
        .appendTo("#data");
      $("<p>This Week: " + weekRes[0].data.human_readable_total + "</p>")
        .appendTo("#data");
    })
    // if either fails, assume unauthorized.
    // abort and show login link
    .fail(function() {
      dayReq.abort();
      weekReq.abort();
      $('<a href="https://www.wakatime.com/login" target="_blank">Please Login</a>')
        .appendTo("#data");
    })
    // either way, remove 'loading' status
    .always(function() {
      $('#status').empty();
    });
});
