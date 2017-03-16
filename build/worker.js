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
  var salt = "";
  var hash = options.algorithm === "MD5" ? CryptoJS.MD5 : CryptoJS.SHA1;


  var updateMain = function(iteration) {

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
  for(i = options.iteration; i<(options.numberOfOperations+options.iteration);i++) {
    res = hash(passphrase,salt).toString();
    if(i > 1000000 && i%100000 === 0) {
      debugger;
    }
    if(i > 5176670 && i < 5176680) {
      debugger;
    }
    if(passphrase === 'linux') {
      debugger;
    }
    if(res === options.hashSearch) {
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
