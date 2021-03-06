import React from 'react';
import {
  CategoryLargeChart, ContinuousLargeChart, IntegratedAnalysisChartLarge,
  TimelineLargeChart
} from "./IntegratedAnalysisChartLarge";
import moment from 'moment'

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
    // let parentNode = props.parentNode;
    let tail = props.tail;

    const column1Handler = {
      continuous: (feature) => {
        let value = (feature.chartSize <= 0)? '無資料':
          (feature.median)? feature.median: ' - ';
        return (
          <td>{value} <img src="/images/icon_median.png" alt="中" className="icon_float"/> </td>
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
        let value = (feature.chartSize <= 0)? '無資料':
          (feature.average)? feature.average: ' - ';
        return (
          <td>{value} <img src="/images/icon_average.png" alt="平" className="icon_float"/> </td>
        );
      },
      category: (feature) => {
        return (feature.chartSize > 0 && feature.maxScale)?
          (<td>{feature.ref? feature.ref[feature.maxScale].codeLabel: feature.maxScale}</td>):
          (<td>無資料</td>);
      },
      date: (feature) => {
        const formatter = {
          year: 'YYYY',
          month: 'YYYY/MM',
          day: 'YYYY/MM-DD',
          hour: 'YYYY/MM/DD HH',
          minute: 'YYYY/MM/DD HH:mm'
        };
        let value = (feature.chartSize <= 0)? '無資料':
          (feature.maxScale)?
            moment(feature.maxScale, 'X').startOf(feature.minPeriod).format(formatter[feature.minPeriod]): ' - ';
        return (<td>{value}</td>);
      }
    };
    const column3Handler = {
      continuous: (feature) => {
        let value = (feature.chartSize <= 0)? '無資料':
          (feature.standardDeviation)? feature.standardDeviation: ' - ';
        return (
          <td>{value} <img src="/images/icon_sd.png" alt="S.D." className="icon_float"/> </td>
        );
      },
      category: (feature) => {
        let value = (feature.chartSize <= 0)? '無資料':
          (feature.maxProportion)? feature.maxProportion: ' - ';
        return (<td>{value}</td>);
      },
      date: (feature) => {
        let value = (feature.chartSize <= 0)? '無資料':
          (feature.maxProportion)? feature.maxProportion: ' - ';
        return (<td>{value}</td>);
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

  // getChartContainer(category) {
  //   switch (category) {
  //     case 'continuous':
  //       return ContinuousSmallChart;
  //     case 'category':
  //       return CategorySmallChart;
  //     case 'date':
  //       return TimelineSmallChart;
  //     default:
  //       return null;
  //   }
  // };

  ComponentChartBody(props) {
    switch (props.feature.category) {
      case 'continuous':
        return <ContinuousSmallChart {...props}/>;
      case 'category':
        return <CategorySmallChart {...props}/>;
      case 'date':
        return <TimelineSmallChart {...props}/>;
      default:
        return <div/>;
    }
  }

  changeView() {
    window.location.href = `/integration/${this.mode}/query/${this.queryId}/analysis/large`;
  };

  ComponentViewSwitcher(props) {
    return (<button type="button" className="btn btn-default fa fa-arrow-left" onClick={props.changeView}/>);
  }
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