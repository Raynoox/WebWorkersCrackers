var Hashes = React.createClass({
  propTypes: {},

  componentWillMount: function() {
    sendRequestJson('get','hash',null,this.successTypesCallback);
  },
  successTypesCallback: function(response) {
    this.setState({
      types: response,
      showTypes: true,
      showHashes: false
    });
  },
  successCallback: function(response) {
    this.setState({
      hashes: response,
      showTypes: false,
      showHashes: true
    });
  },
  showHashes: function(type) {
    sendRequestJson('get','hash/'+type,null,this.successCallback);
    this.setState({
      type: type
    });
  },
  render: function() {
    return (
      <div>
        <div className="hashTable">
        {this.state !== null && this.state.showHashes ? this.renderHashes(): this.renderTypes()}
        </div>
      </div>
    )
  },
  renderTypes: function() {
    if(this.state === null || this.state.types == null) {
      return null;
    }
    return(
      <div>
        {this.state.types.map((type, i) => {
          return (<div className="hashType" key={type+i}>
              <input defaultValue={type} onClick={this.showHashes.bind(null,type)}/>
            </div>);
        })}
      </div>
    )
  },
  renderNewHash: function() {
    return <NewHash type={this.state.type} callback={this.showHashes.bind(null, this.state.type)}/>
  },
  renderHashes: function() {
    return (
      <div>
        TYPE = {this.state.type}

          {this.renderNewHash()}
        {this.state.hashes !== null && this.state.hashes !== undefined ? this.state.hashes.map((hash, i) => {
            return (
                <HashInfo
                    key={ i }
                    id={ hash.ID }
                    hash={ hash.Hash }
                    type={ this.state.type }
                    callback = {this.showHashes.bind(null, this.state.type)}
                  />
            );
          }): null}
      </div>
    )
  }
});
