var NewHash = React.createClass({
  propTypes: {
  },
  getInitialState: function() {
    return {
      inputValue: ''
    };
  },
  onSendClick: function() {
    sendRequestJson('post','/hashes',{Hash:this.state.inputValue},this.successCallback);
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
      <div className="NewHash">
        <input value={this.state.inputValue} id="inputHash" type="text" onChange={this.updateInputValue}></input>
        <input className="sendButton" id='buttonNewHash' value='Send Hash To Crack' onClick={this.onSendClick} readOnly/>
      </div>
    );
  }
})
