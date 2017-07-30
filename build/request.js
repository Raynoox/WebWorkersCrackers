function ParseStringIfJSON(response) {
  try {
    response = JSON.parse(response);
    return response;
  } catch (e) {
    return response;
  }
}

function handleResponse(code, response, successCallback, failureCallback) {
  if (code == 200) {
    if (successCallback) {
      successCallback(response);
    }
 } else if (failureCallback) {
   failureCallback(response);
 }
}
var sendRequestJson = function (method, url, params, successCallback, failureCallback) {
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
      response = ParseStringIfJSON(response);
      if (xhr.status === 200) {
        if(xhr.getResponseHeader("etag")) {
          response.etag = xhr.getResponseHeader("etag");
        }
        handleResponse(xhr.status, response, successCallback, failureCallback);
      }
      if (xhr.status === 400) {
        handleResponse(xhr.status, response, successCallback, failureCallback);
      }
      if (xhr.status === 409) {
        handleResponse(xhr.status, response, successCallback, failureCallback);
      //  ReactRouter.browserHistory.push('/Home');
      }
      if (xhr.status === 404) {
    //    ReactRouter.browserHistory.push(xhr.responseURL);
      }
    }
  };

  xhr.open(method, url, true);
  xhr.setRequestHeader("Content-Type", "application/json");
  if(!!params && !!params.etag){
    xhr.setRequestHeader("If-Match", params.etag);
  }
  xhr.withCredentials = true;

  xhr.send(JSON.stringify(params));
}
