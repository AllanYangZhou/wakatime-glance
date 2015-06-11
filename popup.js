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

document.addEventListener('DOMContentLoaded', function() {
  var dataBlock = document.getElementById('data');
  dataBlock.textContent = 'Loading...';
  makeReq('users/current', function(response) {
    var userData = JSON.parse(response);
    dataBlock.textContent = 'Hello ' + userData.data.full_name;
  }, function() {
    var link = document.createElement('a');
    link.href = 'https://wakatime.com/login';
    link.innerText = 'Click here to login (new tab)';
    link.target = '_blank'; // open in new tab
    dataBlock.textContent = 'Please make sure you are logged ' + 
      'in to WakaTime from this browser';
    dataBlock.appendChild(document.createElement('br'))
    dataBlock.appendChild(link);
  }, function(statusText) {
    document.getElementById('status').textContent = statusText;
  });
});
