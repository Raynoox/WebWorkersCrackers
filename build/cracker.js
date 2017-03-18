var getPassphraseFromIteration = function(iteration) {
  var result = alphabeth[iteration%alphabeth.length];
  var array = [iteration%alphabeth.length];
  iteration=Math.floor(iteration/alphabeth.length);
  while(iteration > 0) {
    result=alphabeth[iteration%alphabeth.length]+result;
    array.unshift(iteration%alphabeth.length);
    iteration=Math.floor(iteration/alphabeth.length);
  }
  return {
    passphrase: result,
    array: array
  };
}
var crackHash = function(data, window, document, component) {

  //for multiple
  var i;
  var workers = [];
  var splittedData = splitData(data.StartHash, data.Iterations, data.numberOfWorkers);
//console.log(splittedData);
  //console.log(getPassphraseFromIteration(data.StartHash).passphrase+"->"+getPassphraseFromIteration(data.StartHash+data.Iterations).passphrase);
  for(i = 0;i<data.numberOfWorkers;i++) {
    //console.log(splittedData[i].StartHash+"->"+(splittedData[i].Iterations+splittedData[i].StartHash)+" | "+getPassphraseFromIteration(splittedData[i].StartHash).passphrase+"->"+getPassphraseFromIteration(splittedData[i].StartHash+splittedData[i].Iterations).passphrase);
    var worker = new Worker('/build/worker.js');
    worker.addEventListener('message', function(e) {
  //    console.log("msg");
      if(e.data.finished.result) {
      //  console.log('FINISHED');
        workers[e.data.finished.workerIndex].finished = true;
        if(e.data.finished.passphrase !== undefined) {

          component.setState({
            result: true,
            crackResult: {
              result: true,
              passphrase: e.data.finished.passphrase,
              StartHash: data.StartHash
            }
          })
          sendRequestJson("post","/finished/",e.data.finished);
        } else {
          if(checkIfDidntFind(workers)) {
            workers.forEach(function(w) {
                      // Worker.terminate() to interrupt the web worker
                      w.worker.terminate();
                    });
component.setState({
              result: true,
              crackResult: {
                result: true,
                passphrase: null,
                StartHash: data.StartHash
              }
            });
          }
        }
        //sendRequestJson('post','/finish/')
      } else {
      //  console.log("Worker id: "+e.data.finished.workerIndex+ " | H/S: "+e.data.finished.hashPerSecond+" now: "+e.data.finished.now+" refreshTime: "+e.data.finished.refreshTime);
        var monitor = document.getElementById(data.Hash+'#worker#'+e.data.finished.workerIndex);
        monitor.innerText = getPassphraseFromIteration(e.data.finished.iteration).passphrase+"\t"+Math.floor(e.data.finished.hashPerSecond);
        //calculate MHS
      }
    })
    //var hash = options.algorithm === "MD5" ? CryptoJS.MD5 : CryptoJS.SHA1;
  /*  component.startWorker(i, {
      StartHash: splittedData[i].StartHash,
      numberOfOperations: splittedData[i].Iterations
    });*/
  //  console.log("workers length = "+ workers.length);
    workers.push({
      worker: worker,
      finished: false});
  }
  for(i=0;i<workers.length;i++) {
  //  console.log("start worker - "+i);
    workers[i].worker.postMessage({
      Hash: data.Hash,
      StartHash: splittedData[i].StartHash,
      Iterations: splittedData[i].Iterations,
      Algorithm: data.Algorithm,
      index: i
    });
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
      return false;
    }
  }
  return true;
}
var alphabeth = "abcdefghijklmnopqrstuvwxyz";
