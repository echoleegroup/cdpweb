import React  from 'react';
import ReactDOM  from 'react-dom';
import url from 'url';
import {BrowserRouter as Router, Route, Switch} from 'react-router-dom';
import AnonymousAnalysisHome from './components/AnonymousQueryHome';
import CustomTargetHomeLayout from './components/CustomTargetLayout';
import IntegratedAnalysisHome from './components/IntegratedQueryHome';
import IntegratedAnalysisQueryOverview from './components/IntegratedQueryTaskOverview';
import IntegratedAnalysisChartLarge from './components/IntegratedAnalysisChartLarge';

(function ($) {
  let internalAjax = $.ajax;

  $.ajax = (options) => {
    options.statusCode = {
      401: () => {
        let url_pathname = url.parse(window.location.href, true, true).pathname;
        location.href = '/login?redirectURL=' + url_pathname;
      }
    };
    return internalAjax(options);
  };
})(jQuery);

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
          <Route exact path="/integration/query/:queryId" component={IntegratedAnalysisQueryOverview}/>
          <Route exact path="/integration/anonymous/query" component={AnonymousAnalysisHome}/>
          <Route exact path="/integration/:mode/query/:queryId/analysis/large" component={IntegratedAnalysisChartLarge}/>
          {/*<Route exact path="/integration/anonymous/query/:queryId/analysis/large" component={AnonymousAnalysisChartLarge}/>*/}
        </Switch>
      </Router>
    );
  }
}

ReactDOM.render((<PortalRoute />), document.getElementById('Portal'));

