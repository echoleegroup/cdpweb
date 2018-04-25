import React from 'react';
import IntegratedAnalysisChartLarge from "./IntegratedAnalysisChartLarge";

export default class AnonymousAnalysisChartLarge extends IntegratedAnalysisChartLarge {
  ComponentLeftColumnGrid(props) {
    return (
      <div className="col-md-9 col-sm-8 col-xs-12">
        {props.children}
      </div>
    );
  };

  ComponentRightColumnGrid(props) {
    return (
      <div className="col-md-3 col-sm-4 col-xs-12">
        {props.children}
      </div>
    );
  };
};