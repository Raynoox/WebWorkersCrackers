var HashInfo = React.createClass({displayName: "HashInfo",
  propTypes: {
    id: React.PropTypes.string.isRequired,
    hash: React.PropTypes.string.isRequired
  },
  numberOfWorkers: 8,
  canStop: true,
  getInitialState: function() {
    return {
      crackResult: {
        result: false
      },
      workers: [],
      isCracking: false
    };
  },
  componentWillUpdate: function (nextProps, nextState) {
    if(this.canStop && nextState.result) {
      this.stopCracking(nextState);
    }
  },
  startCracking: function() {
    this.canStop = true;
    this.setState({
      renderWorkers: true,
      result: false
    });
    sendRequestJson("post","/crack/",{ID: this.props.id, Hash: this.props.hash},this.successStartCallback)
  },
  startWorker(i, data) {
    var workers = this.state.workers;
    workers.push({
      id: i,
      startHash: data.StartHash,
      numberOfOperations: data.numberOfOperations
    });
    this.setState({
      workers: workers
    });
  },
  successStartCallback: function(response) {
    crackHash({
      Hash:this.props.hash,
      StartHash: response.StartHash,
      Iterations: response.Iterations,
      Algorithm: response.Algorithm,
      numberOfWorkers: this.numberOfWorkers},
    window,
    document,
    this);
    this.setState({
      isCracking: true,
      result: false,
      passphrase: null,
      startInfo: {
        StartHash: response.StartHash,
        Iterations: response.Iterations,
        Algorithm: response.Algorithm
      },
      numberOfWorkers: this.numberOfWorkers,
    });
  },
  stopCracking: function(nextState) {
    this.canStop = false;
    this.setState({
      result: false
    });
    var sucCallback = nextState.crackResult.passphrase === null ? this.startCracking : null;
    sendRequestJson("post","/finish/",
    {
      Result: nextState.crackResult.passphrase,
      IsSuccess: nextState.crackResult.passphrase !== null,
      IterationStart: nextState.startInfo.StartHash,
      Iterations: nextState.startInfo.Iterations,
      Algorithm: nextState.startInfo.Algorithm,
      Hash: this.props.hash
    }, sucCallback)
  },
  render: function () {
    return (
      React.createElement("div", {className: "hashInfo"}, 
        "id=", this.props.id, 
        "hash=", this.props.hash, 
        this.renderStartCracking(), 
        this.state.renderWorkers === true && this.state.numberOfWorkers > -1 ? this.renderWorkers(): null
      )
    );
  },
  renderStartCracking: function() {
    var buttonText = this.state.isCracking ? "Stop!" : "Crack me";
    var buttonAction = this.state.isCracking ? this.stopCracking : this.startCracking;
    return (
      React.createElement("span", {className: "startCrack"}, 
        React.createElement("input", {type: "button", readOnly: true, value: buttonText, onClick: buttonAction})
      )
    )
  },
  renderWorkers: function() {
    var i;
    var workers = [];
    for(i = 0; i<this.state.numberOfWorkers;i++) {
      workers.push(this.renderSingleWorker(i));
    }
    return (
      React.createElement("div", null, 
        workers
      )
    );
  },
  renderSingleWorker: function(i) {
    var workerId = this.props.hash +"#worker#"+ i.toString();
    return (React.createElement("div", {key: i}, 
      "Worker: ", i, "---", 
      React.createElement("span", {style: {'display': 'inline-block'}, id: workerId}), 
      React.createElement("span", null, "h/s")
    ));
  }
});
