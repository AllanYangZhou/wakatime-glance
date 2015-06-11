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
  document.getElementById('status').textContent = statusText;
}

document.addEventListener('DOMContentLoaded', function() {
  var dataBlock = document.getElementById('data');
  dataBlock.innerText = 'Loading...';
  var now = new Date();
  var dateFormatted = (now.getMonth() + 1)
    + '/' + now.getDate() + '/' + now.getFullYear();
  var params = '?start=' + dateFormatted + '&end=' + dateFormatted;
  makeReq('users/current/summaries' + params, function(response) {
    var summary = JSON.parse(response);
    dataBlock.innerText = 'Today: ' + summary.data[0].grand_total.text;
  }, function() {
    var link = document.createElement('a');
    link.href = 'https://wakatime.com/login';
    link.innerText = 'Click here to login (new tab)';
    link.target = '_blank'; // open in new tab
    dataBlock.appendChild(document.createElement('br'))
    dataBlock.appendChild(link);
  }, error);
});
