var HashInfo = React.createClass({displayName: "HashInfo",
  propTypes: {
    id: React.PropTypes.string.isRequired,
    hash: React.PropTypes.string.isRequired
  },
  render: function () {
    return (
      React.createElement("div", {className: "hashInfo"}, 
        "id=", this.props.id, 
        "hash=", this.props.hash, 
        this.renderStartCracking()
      )
    );
  }
})
