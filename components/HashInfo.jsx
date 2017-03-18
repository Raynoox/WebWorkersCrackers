var HashInfo = React.createClass({
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
      <div className="hashInfo">
        id={this.props.id}
        hash={this.props.hash}
        {this.renderStartCracking()}
        {this.state.renderWorkers === true && this.state.numberOfWorkers > -1 ? this.renderWorkers(): null}
      </div>
    );
  },
  renderStartCracking: function() {
    var buttonText = this.state.isCracking ? "Stop!" : "Crack me";
    var buttonAction = this.state.isCracking ? this.stopCracking : this.startCracking;
    return (
      <span className="startCrack">
        <input type="button" readOnly value={buttonText} onClick={buttonAction}></input>
      </span>
    )
  },
  renderWorkers: function() {
    var i;
    var workers = [];
    for(i = 0; i<this.state.numberOfWorkers;i++) {
      workers.push(this.renderSingleWorker(i));
    }
    return (
      <div>
        {workers}
      </div>
    );
  },
  renderSingleWorker: function(i) {
    var workerId = this.props.hash +"#worker#"+ i.toString();
    return (<div key={i}>
      Worker: {i}---
      <span style={{'display': 'inline-block'}} id={workerId}></span>
      <span>h/s</span>
    </div>);
  }
});
