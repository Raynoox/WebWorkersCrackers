var crackHash = function(data, window, document, component) {
  var worker = new Worker('/build/worker.js');
  //for multiple
  var i;
  var workers = [];
  var splittedData = splitData(data.StartHash, data.Iterations, data.numberOfWorkers);
  for(i = 0;i<data.numberOfWorkers;i++) {
    worker.addEventListener('message', function(e) {
      console.log("msg");
      if(e.data.finished.result) {
        console.log('FINISHED');
        if(e.data.finished.passphrase !== undefined) {
          component.setState({
            crackResult: {
              result: true,
              passphrase: e.data.finished.passphrase,
              StartHash: data.StartHash
            }
          })
          sendRequestJson("post","/finished/",e.data.finished);
        } else {
          if(checkIfDidntFind(workers)) {
            component.setState({
              crackResult: {
                result: true,
                passphrase: null,
                StartHash: data.StartHash
              }
            });
          }
        }
        console.log(e.data);
        //sendRequestJson('post','/finish/')
      } else {
        //calculate MHS
      }
    })
    //var hash = options.algorithm === "MD5" ? CryptoJS.MD5 : CryptoJS.SHA1;
    component.startWorker(i, {
      StartHash: splittedData[i].StartHash,
      numberOfOperations: splittedData[i].Iterations
    });
    worker.postMessage({
      Hash: data.Hash,
      StartHash: splittedData[i].StartHash,
      Iterations: splittedData[i].Iterations,
      Algorithm: data.Algorithm
    });
    workers.push({
      worker: worker,
      finished: false});
  }
}
var splitData = function(start, iterations, numberOfWorkers) {
  var result = [];
  var x = iterations/numberOfWorkers;
  var last = iterations%numberOfWorkers;
  var s = start;
  var i;
  for(i = 0; i< numberOfWorkers; i++) {
    result.push({
      StartHash: s,
      Iterations: x
    });
    s += x;
  }
  result[numberOfWorkers-1].Iterations += last;
  return result;
}
var checkIfDidntFind = function(workers) {
  var i;
  for (i = 0;i<workers.length;i++) {
    if(workers[i].finished === false) {
      return true;
    }
  }
  return true;
}
