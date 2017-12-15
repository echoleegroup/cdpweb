import React  from 'react';
import ReactDOM  from 'react-dom';

class CustomSearch extends React.Component {
  render() {
    return (
    <div>
      This is Portal.
      </div>
      );
  }
}

ReactDOM.render((<CustomSearch />), document.getElementById('custom-search'));