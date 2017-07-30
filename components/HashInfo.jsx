var HashInfo = React.createClass({
  propTypes: {
    id: React.PropTypes.string.isRequired,
    hash: React.PropTypes.string.isRequired
  },
  numberOfWorkers: 4,
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
    sendRequestJson("post","/pool/"+this.props.type+"/"+this.props.id,{ID: this.props.id, Hash: this.props.hash},this.successStartCallback, this.failureCallback)
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
    if(nextState.crackResult === undefined){
      return;
      }
    var sucCallback = nextState.crackResult === undefined || nextState.crackResult.passphrase === null ? this.startCracking : this.foundHashCallback;
    sendRequestJson("post","/pool/"+this.props.type+"/"+this.props.id+"/"+nextState.crackResult.StartHash,
    {
      Result: nextState.crackResult.passphrase,
      IsSuccess: nextState.crackResult.passphrase !== null,
      IterationStart: nextState.startInfo.StartHash,
      Iterations: nextState.startInfo.Iterations,
      Algorithm: nextState.startInfo.Algorithm,
      Hash: this.props.hash
    }, sucCallback)
  },
  foundHashCallback: function(response) {
    this.setState({
      renderWorkers: false,
      showMore: false
    });
  },
  fetchMoreCallback: function(response) {
    this.setState({
      showMore: true,
      finished: response.IsFinished,
      iterationsCompleted: response.Next,
      decoded: response.Decoded,
      etag: response.etag
    });
  },
  fetchMore: function() {
    sendRequestJson("get","hash/"+this.props.type+"/"+this.props.id,null,this.fetchMoreCallback)
  },
  fetchIterations: function() {
    sendRequestJson("get","pool/"+this.props.type+"/"+this.props.id,null,this.fetchIterationsCallback)
  },
  fetchIterationsCallback: function(response) {
    this.setState({
      showAllIterations: true,
      iterations: response
    })
  },
  deleteHash: function() {
    sendRequestJson("delete","hash/"+this.props.type+"/"+this.props.id, null, this.successDeleteCallback,this.failureCallback)
  },
  tokenForEdit: function() {
    sendRequestJson("post","token",null,this.editHash)
  },
  editHash: function(token) {
    sendRequestJson("put","hash/"+this.props.type+"/"+this.props.id, {
      etag: this.state.etag,
      ID: this.props.id,
      Hash: this.props.hash,
      Type:this.props.type,
      Next:Number(this.state.iterationsCompleted),
      Decoded:this.state.decoded,
      IsFinished:this.state.finished,
	    Token:token}, this.successEditCallback, this.failureCallback);
  },
  failureCallback: function(response) {
    alert(response);
  },
  successEditCallback: function() {
    this.setState({
      showMore: false
    });
    this.props.callback();
  },
  successDeleteCallback: function() {
    this.props.callback();
    alert("hash deleted");
  },
  showMore: function() {
    if(this.state.showMore) {
      this.setState({
        showMore: false
      })
    } else{
      this.fetchMore();
    }
  },
  showIterations: function() {
    if(this.state.showAllIterations) {
      this.setState({
        showAllIterations: false
      })
    } else {
      this.fetchIterations();
    }
  },
  render: function () {
    return (
      <div className="hashInfo">
        <div className="inner">
        {/*id={this.props.id}*/}
        <br/>
        hash={this.props.hash}
        </div>
        {this.renderShowMore()}
        {this.state.showMore ? this.renderMoreInfo() : null}
        {this.state.finished !== true ? this.renderStartCracking() : null}
        {this.state.renderWorkers === true && this.state.numberOfWorkers > -1 ? this.renderWorkers(): null}
      </div>
    );
  },
  changeInputIteration: function(e) {
    this.setState({
      iterationsCompleted: e.target.value
    });
  },
  renderMoreInfo: function() {
    return(<div>
      status = {this.state.finished ? "FINISHED" : "IN PROGRESS"}
      <br/>
      iterations completed = <input value={this.state.iterationsCompleted} onChange={this.changeInputIteration}/>
      <br/>
      decoded hash = {!this.state.finished ? "NOT YET DECODED" : this.state.decoded}
      <br/>
      etag = {this.state.etag}
      {this.renderEditButton()}
      {this.renderDeleteButton()}
      {this.renderShowIterationsButton()}
      {this.state.showAllIterations ? this.renderIterations() : null}
    </div>)
  },
  renderEditButton: function() {
    return (<button value="save edit" onClick={this.tokenForEdit}>edit</button>);
  },
  renderShowMore: function() {
      return(<div className="moreInfo">
        <input type="button" readOnly value="Show more" onClick={this.showMore}></input>
      </div>);
  },
  renderIterations: function() {
    return(<div className="iterations">
      {this.state.iterations !== null ? this.state.iterations.map((iter, i)  => {
          return (
            <div key={"iterations"+i}>iteration {iter.IterationStarted} started at {iter.Timestamp}</div>
          );
        }) : "no iterations available"}
    </div>)
  },
  renderShowIterationsButton: function() {
    return(<button onClick={this.showIterations}>show iterations</button>);
  },
  renderDeleteButton: function() {
    return (<button value="delete" onClick={this.deleteHash}>delete</button>);
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
