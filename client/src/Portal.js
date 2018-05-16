import React  from 'react';
import ReactDOM  from 'react-dom';
import {BrowserRouter as Router, Route, Switch} from 'react-router-dom';
import AnonymousAnalysisHome from './components/AnonymousQueryHome';
import CustomTargetHomeLayout from './components/CustomTargetLayout';
import IntegratedAnalysisHome from './components/IntegratedQueryHome';
import IntegratedAnalysisQueryOverview from './components/IntegratedQueryTaskOverview';
import AnonymousQueryTaskOverview from './components/AnonymousQueryTaskOverview';

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
          <Route exact path="/target/custom/filter/:mdId/:batId" component={CustomTargetHomeLayout}/>
          <Route exact path="/integration/query" component={IntegratedAnalysisHome}/>
          <Route exact path="/integration/anonymous/query" component={AnonymousAnalysisHome}/>
          <Route exact path="/integration/identified/query/:queryId" component={IntegratedAnalysisQueryOverview}/>
          <Route exact path="/integration/anonymous/query/:queryId" component={AnonymousQueryTaskOverview}/>
        </Switch>
      </Router>
    );
  }
}

ReactDOM.render((<PortalRoute />), document.getElementById('Portal'));

