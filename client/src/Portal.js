import React  from 'react';
import ReactDOM  from 'react-dom';

class Portal extends React.Component {
  render() {
    return (
    <div>
      This is Portal.
      </div>
      );
  }
}

ReactDOM.render((<Portal />), document.getElementById('Portal'));