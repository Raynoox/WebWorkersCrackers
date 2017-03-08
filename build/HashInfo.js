var HashInfo = React.createClass({displayName: "HashInfo",
  propTypes: {
    id: React.PropTypes.string.isRequired,
    hash: React.PropTypes.string.isRequired
  },
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
    if(this.state.crackResult.result) {
      this.stopCracking();
      this.startCracking();
    }
  },
  startCracking: function() {
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
    var sucCallback = this.state.crackResult.passphrase === null ? null : this.startCracking;
    sendRequestJson("post","/finished/", this.state.crackResult, sucCallback)
  },
  render: function () {
    return (
      React.createElement("div", {className: "hashInfo"}, 
        "id=", this.props.id, 
        "hash=", this.props.hash, 
        this.renderStartCracking()
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
    return (
      React.createElement("div", null, 
        this.state.workers.map((worker, i) => {
          return(
            React.createElement("div", null, 
              "id= ", worker.id, 
              "startHash = ", worker.startHash, 
              "noi = ", worker.numberOfOperations
            )
          )
        })
      )
    );
  }
})
