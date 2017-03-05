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
      React.createElement("div", {className: "hashTable"}, "tabela", 
      this.renderHashes()
      )
    )
  },
  renderHashes: function() {
    return (
      React.createElement("div", null, 
        this.state.hashes.map((hash, i) => {
            return (
                React.createElement(HashInfo, {
                    key:  i, 
                    id:  hash.ID, 
                    value:  hash.Hash}
                  )
            );
          })
      )
    )
  }
});
