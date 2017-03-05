function ParseStringIfJSON(response) {
  try {
    response = JSON.parse(response);
    return response;
  } catch (e) {
    return response;
  }
}

function handleResponse(response, successCallback, failureCallback) {
  response = ParseStringIfJSON(response);
  if (response.status) {
    if (successCallback) {
      successCallback(response);
    }
  } else if (failureCallback) {
    failureCallback(response);
  }
}
function sendRequestJson(method, url, params, successCallback, failureCallback) {
  const xhr = new XMLHttpRequest();
  xhr.onreadystatechange = () => {
    if (xhr.readyState === 4) {
      let response;
      if (!xhr.responseType || xhr.responseType === "text") {
        response = xhr.responseText;
      } else if (xhr.responseType === "document") {
        response = xhr.responseXML;
      } else {
        response = xhr.response;
      }
      if (xhr.status === 200) {
        handleResponse(response, successCallback, failureCallback);
      }
      if (xhr.status === 401) {
        ReactRouter.browserHistory.push('/Home');
      }
      if (xhr.status === 404) {
        ReactRouter.browserHistory.push(xhr.responseURL);
      }
    }
  };

  xhr.open(method, url, true);
  xhr.setRequestHeader("Content-Type", "application/json");

  xhr.withCredentials = true;

  xhr.send(JSON.stringify(params));
}
function request(method, url, params) {
  const xhr = new XMLHttpRequest();
  xhr.onreadystatechange = () => {
    if (xhr.readyState === 4) {
      let response;
      if (!xhr.responseType || xhr.responseType === "text") {
        response = xhr.responseText;
      } else if (xhr.responseType === "document") {
        response = xhr.responseXML;
      } else {
        response = xhr.response;
      }
      if (xhr.status === 200) {
        console.log("success");
      }
    }
  };
  xhr.open(method, url, true);
  xhr.setRequestHeader("Content-Type", "application/json");
  xhr.send(JSON.stringify(params));
}
document.getElementById("buttonNewHash").addEventListener("click", function() {
  let inputValue = document.getElementById("inputHash");
  request("post","/hash/",{Hash: inputValue.value});
});
