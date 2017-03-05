var NewHash = React.createClass({displayName: "NewHash",
  propTypes: {
  },
  getInitialState: function() {
    return {
      inputValue: ''
    };
  },
  onSendClick: function() {
    sendRequestJson('post','/hash',{Hash:this.state.inputValue},this.successCallback);
  },
  successCallback: function() {
    console.log("success");
  },
  updateInputValue: function(event) {
    this.setState({
      inputValue: event.target.value
    });
  },
  render: function () {
    return (
      React.createElement("div", {className: "NewHash"}, 
        React.createElement("input", {value: this.state.inputValue, id: "inputHash", type: "text", onChange: this.updateInputValue}), 
        React.createElement("input", {className: "sendButton", id: "buttonNewHash", value: "Send Hash To Crack", onClick: this.onSendClick, readOnly: true})
      )
    );
  }
})
