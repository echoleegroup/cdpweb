import React  from 'react';
import ReactDOM  from 'react-dom';
import {BrowserRouter as Router, Route, Switch} from 'react-router-dom';
import IntegratedAnalysisChartLarge from './components/IntegratedAnalysisChartLarge';

// class Home extends React.Component {
//   render() {
//     return (
//     <div>
//       This is Portal.
//       </div>
//       );
//   }
// }

class PortalRoute extends React.Component {
  render() {
    return (
      <Router>
        <Switch>
          {/*<Route exact path="/" component={Home}/>*/}
          <Route exact path="/integration/:mode/query/:queryId/analysis/large" component={IntegratedAnalysisChartLarge}/>
          {/*<Route exact path="/integration/anonymous/query/:queryId/analysis/large" component={AnonymousAnalysisChartLarge}/>*/}
        </Switch>
      </Router>
    );
  }
}

ReactDOM.render((<PortalRoute />), document.getElementById('Portal'));

