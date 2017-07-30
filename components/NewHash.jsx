var NewHash = React.createClass({
  propTypes: {
  },
  getInitialState: function() {
    return {
      inputValue: ''
    };
  },
  onSendClick: function() {
    sendRequestJson('post','/token',null,this.onTokenCallback);
  },
  onTokenCallback: function(token) {
    sendRequestJson('post','/hash'+"/"+this.props.type,{hash:this.state.inputValue, token:token},this.successCallback,this.failureCallback);
  },
  failureCallback: function(response) {
    alert(response);
  },
  successCallback: function() {
    this.setState({
      inputValue: ""
    });
    this.props.callback()
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
