var HashInfo = React.createClass({
  propTypes: {
    id: React.PropTypes.string.isRequired,
    hash: React.PropTypes.string.isRequired
  },
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
  componentWillUpdate: function () {
    if(this.canStop && this.state.result) {
      this.stopCracking();
    }
  },
  startCracking: function() {
    this.canStop = true;
    this.setState({
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
      numberOfWorkers: 2},
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
      }
    });
  },
  stopCracking: function() {
    this.canStop = false;
    this.setState({
      result: false
    });
    var sucCallback = this.state.crackResult.passphrase === null ? this.startCracking : null;
    sendRequestJson("post","/finish/",
    {
      Result: this.state.crackResult.passphrase,
      IsSuccess: this.state.crackResult.passphrase !== null,
      IterationStart: this.state.startInfo.StartHash,
      Iterations: this.state.startInfo.Iterations,
      Algorithm: this.state.startInfo.Algorithm,
      Hash: this.props.hash
    }, sucCallback)
  },
  render: function () {
    return (
      <div className="hashInfo">
        id={this.props.id}
        hash={this.props.hash}
        {this.renderStartCracking()}
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
    return (
      <div>
        {this.state.workers.map((worker, i) => {
          return(
            <div>
              id= {worker.id}
              startHash = {worker.startHash}
              noi = {worker.numberOfOperations}
            </div>
          )
        })}
      </div>
    );
  }
})
