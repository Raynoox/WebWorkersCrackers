var Hashes = React.createClass({
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
      <div>
        {this.renderNewHash()}
        <div className="hashTable">tabela
        {this.state !== null && this.state.hashes !== undefined ? this.renderHashes(): null}
        </div>
      </div>
    )
  },
  renderNewHash: function() {
    return <NewHash/>
  },
  renderHashes: function() {
    return (
      <div>
        {this.state.hashes.map((hash, i) => {
            return (
                <HashInfo
                    key={ i }
                    id={ hash.ID }
                    hash={ hash.Hash }
                  />
            );
          })}
      </div>
    )
  }
});
