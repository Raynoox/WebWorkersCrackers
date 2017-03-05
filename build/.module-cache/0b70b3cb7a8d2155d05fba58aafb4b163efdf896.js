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
  renderStartCracking: function() {
    var buttonText = isCracking ? "Stop!" : "Crack me";
    var buttonAction = isCracking ? this.stopCracking() : this.startCracking();
    return (
      React.createElement("div", {className: "startCrack"}, 
        React.createElement("input", {type: "button", readOnly: true, value: buttonText, onClick: buttonAction})
      )
    )
  }
})
