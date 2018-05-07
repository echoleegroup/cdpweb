import React from 'react';
import {
  CategoryLargeChart, ContinuousLargeChart, IntegratedAnalysisChartLarge,
  TimelineLargeChart, FeatureNavigator
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

  ComponentNavigatorTree(props) {
    let node = props.node;
    return (
      <FeatureStatisticNavigator node={node}
                                 selectNode={props.selectNode}
                                 selected={props.selected}/>
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

class FeatureStatisticNavigator extends FeatureNavigator {
  ComponentFeatureRow(props) {
    return (
      <tr>
        <th>
          <a href="javascript:;"
             className={props.cssClass}
             onClick={props.tailClickHandler}>{props.item.label}</a>
        </th>
        <td>最多為</td>
        <td>2009</td>
        <td>12.12%</td>
      </tr>
    );
  };
}