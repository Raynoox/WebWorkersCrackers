var HashInfo = React.createClass({
  propTypes: {
    id: React.PropTypes.string.isRequired,
    hash: React.PropTypes.string.isRequired
  },
  getInitialState: function() {
    return {
      isCracking: false
    };
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
  startCracking: function() {
    sendRequestJson("post","/crack/",{ID: this.props.id, Hash: this.props.hash},this.successStartCallback)
  },
  successStartCallback: function(response) {
    crackHash({
      Hash:this.props.hash,
      StartHash: response.StartHash,
      Iterations: response.Iterations,
      Algorithm: response.Algorithm},
    window,
    document);
    this.setState({
      startInfo: {
        StartHash: response.StartHash,
        Iterations: response.Iterations,
        Algorithm: response.Algorithm
      }
    });
  },
  stopCracking: function() {

  },
  renderStartCracking: function() {
    var buttonText = this.state.isCracking ? "Stop!" : "Crack me";
    var buttonAction = this.state.isCracking ? this.stopCracking : this.startCracking;
    return (
      <span className="startCrack">
        <input type="button" readOnly value={buttonText} onClick={buttonAction}></input>
      </span>
    )
  }
})
