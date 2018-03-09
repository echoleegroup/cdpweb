import React  from 'react';
import ReactDOM  from 'react-dom';
import url from 'url';
import {BrowserRouter as Router, Route, Switch} from 'react-router-dom';
import CustomTargetFilterHome from './components/CustomTargetFilterHome';
import IntegratedAnalysisHome from './components/IntegratedAnalysisHome';
import IntegratedAnalysisQueryOverview from './components/IntegratedAnalysisQueryOverview';

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
          <Route exact path="/target/custom/filter/:mdId/:batId" component={CustomTargetFilterHome}/>
          <Route exact path="/integration/query" component={IntegratedAnalysisHome}/>
          <Route exact path="/integration/query/:queryId" component={IntegratedAnalysisQueryOverview}/>
        </Switch>
      </Router>
    );
  }
}

ReactDOM.render((<PortalRoute />), document.getElementById('Portal'));

