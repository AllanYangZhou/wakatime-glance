function makeReq(url, successCallback, unAuthCallback, errorCallback) {
  var prefix = 'https:/wakatime.com/api/v1/';
  var xhr = new XMLHttpRequest();
  xhr.open('GET', prefix + url, true);
  xhr.onload = function(e) {
    if (xhr.readyState === 4) {
      if (xhr.status === 200) {
        successCallback(xhr.response);
      } else if (xhr.status === 401){
        unAuthCallback();
      } else {
        errorCallback(xhr.statusText);
      }
    }
  };
  xhr.onerror = errorCallback(xhr.statusText);
  xhr.send(null);
}

function clear(node) {
  while(node.hasChildNodes()) {
    node.removeChild(node.lastChild);
  }
}

function error(statusText) {
  console.log('statusText');
}

document.addEventListener('DOMContentLoaded', function() {
  var dataBlock = document.getElementById('data');
  var statusBar = document.getElementById('status');
  var now = new Date();
  // current date in mm/dd/yyyy format
  var dateFormatted = (now.getMonth() + 1)
    + '/' + now.getDate() + '/' + now.getFullYear();
  var params = '?start=' + dateFormatted + '&end=' + dateFormatted;
  makeReq('users/current/summaries' + params, function(response) {
    var summary = JSON.parse(response);
    dataBlock.innerText = 'Today: ' + summary.data[0].grand_total.text;
    // make call for weekly stats
    makeReq('users/current/stats/last_7_days', function(response) {
      clear(statusBar); // remove loading indicator
      var weekStats = JSON.parse(response);
      dataBlock.innerText += '\nThis week: ' + weekStats.data.human_readable_total;
    }, function() {
      console.log("Problem retrieving weekly data");
    }, error);
  }, function() {
    clear(statusBar);
    // assume 401 means the user is not logged in
    var link = document.createElement('a');
    link.href = 'https://wakatime.com/login';
    link.innerText = 'Click here to login (new tab)';
    link.target = '_blank'; // open in new tab
    dataBlock.appendChild(document.createElement('br'))
    dataBlock.appendChild(link);
  }, error);
});
