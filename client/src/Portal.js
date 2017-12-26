import React  from 'react';
import ReactDOM  from 'react-dom';
import {BrowserRouter as Router, Route, Switch} from 'react-router-dom';
import TargetFilterHome from './components/TargetFilterHome';

class Home extends React.Component {
  render() {
    return (
    <div>
      This is Portal.
      </div>
      );
  }
}

class PortalRoute extends React.Component {
  render() {
    return (
      <Router>
        <Switch>
          <Route exact path="/" component={Home}/>
          <Route path="/target/filter" component={TargetFilterHome}/>
          <Route path="/consumer/filter/:action" component={Home}/>
        </Switch>
      </Router>
    );
  }
}

ReactDOM.render((<PortalRoute />), document.getElementById('Portal'));