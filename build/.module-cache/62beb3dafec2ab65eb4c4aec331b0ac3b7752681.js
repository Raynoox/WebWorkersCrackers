var HashInfo = React.createClass({displayName: "HashInfo",
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
      React.createElement("div", {className: "hashInfo"}, 
        "id=", this.props.id, 
        "hash=", this.props.hash, 
        this.renderStartCracking()
      )
    );
  },
  startCracking: function() {
    sendRequestJson("get","/crack/",{ID: this.state.id, Hash: this.state.hash},this.successStartCallback)
  },
  successStartCallback: function(response) {
    this.setState({
      startInfo: {
        startHash: response.startHash,
        iterations: response.iterations,
        algorithm: response.algorithm
      }
    });
  },
  stopCracking: function() {

  },
  renderStartCracking: function() {
    var buttonText = this.state.isCracking ? "Stop!" : "Crack me";
    var buttonAction = this.state.isCracking ? this.stopCracking() : this.startCracking();
    return (
      React.createElement("span", {className: "startCrack"}, 
        React.createElement("input", {type: "button", readOnly: true, value: buttonText, onClick: buttonAction})
      )
    )
  }
})
