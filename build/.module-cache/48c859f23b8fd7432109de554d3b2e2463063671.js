var Hashes = React.createClass({displayName: "Hashes",
  propTypes: {},

  componentWillMount: function() {
    sendRequestJson('get','hashlist',null,this.successCallback);
  },
  successCallback: function(response) {
    this.setState({
      hashes: response
    })
    console.log(response);
  },
  render: function() {
    return (
      React.createElement("div", null, 
        this.renderNewHash(), 
        React.createElement("div", {className: "hashTable"}, "tabela", 
        this.state !== null && this.state.hashes !== undefined ? this.renderHashes(): null
        )
      )
    )
  },
  renderNewHash: function() {
    return React.createElement(NewHash, null)
  },
  renderHashes: function() {
    return (
      React.createElement("div", null, 
        this.state.hashes.map((hash, i) => {
            return (
                React.createElement(HashInfo, {
                    key:  i, 
                    id:  hash.ID, 
                    hash:  hash.Hash}
                  )
            );
          })
      )
    )
  }
});
