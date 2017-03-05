var crackHash = function(data, window, document) {
  var worker = new Worker('/build/worker.js');
  //for multiple
  worker.addEventListener('message', function(e) {
    console.log("msg");
    if(e.data.finished.result) {
      console.log('FINISHED');
      console.log(e.data);
      //sendRequestJson('post','/finish/')
    } else {
      //calculate MHS
    }
  })
  worker.postMessage({
    Hash: data.Hash,
    StartHash: data.StartHash,
    Iterations: data.Iterations,
    Algorithm: data.Algorithm
  })
}
