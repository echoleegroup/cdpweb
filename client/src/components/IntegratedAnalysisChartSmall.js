import React from 'react';
import {
  CategoryLargeChart, ContinuousLargeChart, IntegratedAnalysisChartLarge,
  TimelineLargeChart
} from "./IntegratedAnalysisChartLarge";

export default class IntegratedAnalysisChartSmall extends IntegratedAnalysisChartLarge {
  constructor(props) {
    super(props);
    this.chartHeight = '300px';
  };

  ComponentLeftColumnGrid(props) {
    return (
      <div className="col-md-8 col-sm-7 col-xs-12">
        {props.children}
      </div>
    );
  };

  ComponentRightColumnGrid(props) {
    return (
      <div className="col-md-4 col-sm-5 col-xs-12">
        {props.children}
      </div>
    );
  };

  getChartContainer(category) {
    switch (category) {
      case 'continuous':
        return ContinuousSmallChart;
      case 'category':
        return CategorySmallChart;
      case 'date':
        return TimelineSmallChart;
      default:
        return null;
    }
  };

  changeView() {
    window.location.href = `/integration/${this.mode}/query/${this.queryId}/analysis/large`;
  };
};

class ContinuousSmallChart extends ContinuousLargeChart {
  constructor(props) {
    super(props);
    this.chartHeight = '300px';
  }
}

class CategorySmallChart extends CategoryLargeChart {
  constructor(props) {
    super(props);
    this.chartHeight = '300px';
  }
}

class TimelineSmallChart extends TimelineLargeChart {
  constructor(props) {
    super(props);
  }
}