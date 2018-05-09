import React from 'react';
import {
  CategoryLargeChart, ContinuousLargeChart, IntegratedAnalysisChartLarge,
  TimelineLargeChart, FeatureNavigator
} from "./IntegratedAnalysisChartLarge";

const ROW_CELL_DATA_HANDLER = {
  category: () => {},
  date: () => {},
  continuous: (feature) => {
    return []
  }
};

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

  ComponentFeatureRow(props) {
    let parentNode = props.parentNode;
    let tail = props.tail;
    console.log('tail.category: ', tail);

    const column1Handler = {
      continuous: (feature) => {
        return (
          <td>{feature.median} <img src="/images/icon_median.png" alt="中" className="icon_float"/> </td>
        );
      },
      category: (feature) => {
        return (<td>最大為</td>);
      },
      date: (feature) => {
        return (<td>最大為</td>);
      }
    };
    const column2Handler = {
      continuous: (feature) => {
        return (
          <td>{feature.average} <img src="/images/icon_average.png" alt="平" className="icon_float"/> </td>
        );
      },
      category: (feature) => {
        return (<td>{feature.ref? feature.ref[feature.maxScale].codeLabel: feature.maxScale}</td>);
      },
      date: (feature) => {
        return (<td>{feature.ref? feature.ref[feature.maxScale].codeLabel: feature.maxScale}</td>);
      }
    };
    const column3Handler = {
      continuous: (feature) => {
        return (
          <td>{feature.standardDeviation} <img src="/images/icon_sd.png" alt="S.D." className="icon_float"/> </td>
        );
      },
      category: (feature) => {
        return (<td>{feature.maxProportion}%</td>);
      },
      date: (feature) => {
        return (<td>{feature.maxProportion}%</td>);
      }
    };

    return (
      <tr>
        {props.children}
        {column1Handler[tail.category](tail)}
        {column2Handler[tail.category](tail)}
        {column3Handler[tail.category](tail)}
      </tr>
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
//
// class FeatureStatisticNavigator extends FeatureNavigator {
//   ComponentFeatureRow(props) {
//     return (
//       <tr>
//         <th>
//           <a href="javascript:;"
//              className={props.cssClass}
//              onClick={props.tailClickHandler}>{props.item.label}</a>
//         </th>
//         <td>最多為</td>
//         <td>2009</td>
//         <td>12.12%</td>
//       </tr>
//     );
//   };
// }