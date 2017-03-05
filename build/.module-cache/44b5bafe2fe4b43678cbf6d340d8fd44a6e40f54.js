var Hashes = React.createClass({displayName: "Hashes",
  propTypes: {},

  componentWillMount: function() {
    sendRequestJson('get','hashlist',null,this.successCallback.bind(this));
  },
  successCallback: function(response) {
    console.log(response);
  },
  render: function() {
    return (
      React.createElement("div", {className: "hashTable"}, "tabela")
    )
  }
});
