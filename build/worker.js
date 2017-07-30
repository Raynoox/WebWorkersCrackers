(function(s){
  importScripts('/build/core-min.js');
  importScripts('/build/md5-min.js');
  importScripts('/build/sha1-min.js');
  importScripts('/build/cracker.js');
s.addEventListener('message', function(e) {
  var options = {
    hashSearch: e.data.Hash,
    iteration: e.data.StartHash,
    numberOfOperations: e.data.Iterations,
    algorithm: e.data.Algorithm,
    workerIndex: e.data.index
  }
  console.log(options.workerIndex);
  var salt = "";
  var hash = options.algorithm === "md-5" ? CryptoJS.MD5 : CryptoJS.SHA1;
  console.log(options);
  var startTime = Date.now();
  var refreshRate = 10;
  var refreshTime = startTime;
  var updateMain = function(iteration) {
    var now = Date.now();
    if(now/1000 - refreshTime/1000 > 1/refreshRate) {
      s.postMessage({
        finished: {
          now: now,
          refreshTime: refreshTime,
          result: false,
          hashPerSecond: (iteration-options.iteration)/((now-startTime)/1000),
          iterationsCompleted: iteration - options.iteration,
          workerIndex: options.workerIndex,
          iteration: iteration
        }
      });
      refreshTime = now;
    }
  }
  var getPassphraseFromArray = function(array) {
    var i;
    var result = "";
    for( i =0;i < array.length; i++) {
      result=result+alphabeth[array[i]];
    }
    return result;
  }
  var nextIteration = function(passphrase, array) {
    var i = array.length-1;
    array[i]++;
    if(array[i]<alphabeth.length){ //use alphabeth.length
      passphrase = passphrase.substr(0,i) + alphabeth[array[i]];
      return {
        array: array,
        passphrase: passphrase
      };
    }

    while(i>0 && array[i] >= alphabeth.length) {
        array[i] = 0;
        array[i-1]++;
      i--;
    }
    if( i==0 && array[i] >= alphabeth.length) {
      array[0] = 0;
      array.unshift(0);
    }
    return {
      array: array,
      passphrase: getPassphraseFromArray(array)
    };
  }
  //main loop
  var obj = getPassphraseFromIteration(options.iteration);
  var passphrase = obj.passphrase;
  var indexArray = obj.array;
  var res;
  console.log(options.iteration);
  console.log(options.numberOfOperations);
  for(i = options.iteration; i<(options.numberOfOperations+options.iteration);i++) {
    if(i >= 475000 && i+options.numberOfOperations < 476086) {
      console.log(passphrase);
      ;
      console.log("x");
      ;
      console.log("x");
      ;
      console.log("x");
      ;
      console.log("x");
      ;
      console.log("x");
    }
    res = hash(passphrase,salt).toString();
    if(i%10000 === 0 ) {
      console.log(passphrase);
      console.log(res);
    }
    if(passphrase === 'bcdh') {
      console.log(res);
      console.log(options.hashSearch);
      console.log("x");
      console.log("x");
      console.log("x");
      console.log("x");
      console.log("x");
    }
  //  if(i > 1000000 && i%100000 === 0) {
    //  debugger;
  //  }
    if(passphrase === 'linux') {
      //debugger;
    }
    if(res === options.hashSearch) {
      console.log("ha")
      console.log("ha")
      console.log("ha")
      console.log("ha")
      console.log("ha")
      console.log("ha")
      console.log("ha")

      s.postMessage({
        finished: {
          result: true,
          passphrase: passphrase,
          workerIndex: options.workerIndex
        }
      });
      break;
    }
    obj = nextIteration(passphrase, indexArray);
    passphrase = obj.passphrase;
    indexArray = obj.array;
    updateMain(i);
  }
  s.postMessage({
    finished: {
      result: true,
      noi: options.numberOfOperations,
      workerIndex: options.workerIndex
    }
  });
})
}(self));
