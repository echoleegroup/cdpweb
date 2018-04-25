import React from 'react';
import Loader from 'react-loader';
import {isEmpty} from 'lodash';
import Rx from "rxjs/Rx";
import AmCharts from '@amcharts/amcharts3-react';
import ItemTreeNavigator from './ItemTreeNavigator';
import {getNavigateFeatures, getQueryTask, getChartData} from '../actions/integrated-analysis-action';

export default class IntegratedAnalysisChartLarge extends React.PureComponent {
  constructor(props) {
    super(props);
    this.queryId = this.props.match.params.queryId;
    this.mode = this.props.match.params.mode;
    this.state = {
      selectedFeature: {},
      selectedFeaturePath: [],
      features: [],
      records: 0,
      isLoaded: true,
      chart: {}
    };
  };

  // shouldComponentUpdate(nextProps, nextState) {
  //   let update = (nextState.selectedFeature.size === 0 || this.state.selectedFeature !== nextState.selectedFeature);
  //   console.log('shouldComponentUpdate?: ', update);
  //   return update;
  // }

  componentWillMount() {
    this.selectFeature = (feature, ...parents) => {
      console.log('select feature : ', feature);
      this.setState({
        selectedFeature: feature,
        selectedFeaturePath: parents,
        isLoaded: false
      });

      this.fetchChartData(this.mode, this.queryId, feature.id);
    };

    this.fetchPreparedData();
  };

  fetchPreparedData() {
    const _getNavigateFeatures = Rx.Observable.bindCallback(getNavigateFeatures)(this.mode, this.queryId);
    const _getQueryTask = Rx.Observable.bindCallback(getQueryTask)(this.queryId);

    Rx.Observable.forkJoin(_getNavigateFeatures, _getQueryTask).subscribe(res => {
      this.setState({
        features: res[0].features,
        records: res[1].records
      });
    });
  };

  fetchChartData(mode, queryId, featureId) {
    getChartData(mode, queryId, featureId, data => {
      console.log('get chart data: ', data);
      this.setState({
        feature: data.feature,
        chart: data.chart,
        isLoaded: true
      });
    });
  };

  ComponentLeftColumnGrid(props) {
    return (
      <div className="col-md-3 col-sm-4 col-xs-12">
        {props.children}
      </div>
    );
  };

  ComponentRightColumnGrid(props) {
    return (
      <div className="col-md-9 col-sm-8 col-xs-12">
        {props.children}
      </div>
    );
  };

  render() {
    let ComponentLeftColumnGrid = this.ComponentLeftColumnGrid;
    let ComponentRightColumnGrid = this.ComponentRightColumnGrid;
    return (
      <div className="row">
        {/*<!-- 左欄 Start -->*/}
        <ComponentLeftColumnGrid>
          {/*<!-- table set Start -->*/}
          <ItemTreeNavigator nodes={this.state.features}
                             selectNode={this.selectFeature}
                             selected={this.state.selectedFeature}/>
        </ComponentLeftColumnGrid>
        {/*<!-- 右欄 Start -->*/}
        <ComponentRightColumnGrid>
          <Loader loaded={this.state.isLoaded}>
            <FeatureAnalysis selectedFeature={this.state.selectedFeature}
                             selectedFeaturePath={this.state.selectedFeaturePath}
                             feature={this.state.feature}
                             chart={this.state.chart}
                             unit={this.state.unit}
                             description={this.state.description}
                             dataSource={this.state.dataSource}/>
          </Loader>
          {/*<!-- table set Start -->*/}
          <TaskDataInformation records={this.state.records}/>
        </ComponentRightColumnGrid>
      </div>
    );
  };
};

class TaskDataInformation extends React.PureComponent {
  constructor(props) {
    super(props);
    this.recordText = '觀察顧客數';
  };

  render() {
    return (
      <div className="table_block table-responsive">
        <h2>客群資訊</h2>
        <div className="table-responsive">
          <table className="table">
            <tbody>
            <tr>
              <th>{this.recordText}：</th>
              <td>{this.props.records || 0}</td>
            </tr>
            </tbody>
          </table>
        </div>
        <div className="btn-block center-block">
          <button type="button" className="btn btn-lg btn-default">條件總覽</button>
        </div>
      </div>
    );
  }
}

class FeatureAnalysis extends React.PureComponent {
  ComponentChart(props) {
    switch (props.chart.category) {
      case 'continuous':
        return <ContinuousChart {...props}/>;
      case 'category':
        return <CategoryChart {...props}/>;
      case 'date':
        return <TimelineChart {...props}/>;
      default:
        return null;
    }
  };

  render() {
    let ComponentChart = this.ComponentChart;
    let headline = '';
    let display = 'none';
    if (!isEmpty(this.props.selectedFeature)) {
      headline = this.props.selectedFeaturePath.reduce((title, node) => {
        return `${title}${node.label} > `;
      }, '') + this.props.selectedFeature.label;

      display = '';
    }

    return (
      <div className="table_block table-responsive" style={{display: display}}>
        <h2>{headline}</h2>
        <h3>內容與分佈
          {/*<i flow="right" tooltip="2016年有參與汰舊換新補助的車主，車主需為自然人，且舊車需為TOYOTA"/>*/}
        </h3>
        <ComponentChart feature={this.props.feature}
                        chart={this.props.chart}
                        selectedFeature={this.props.selectedFeature}/>
        <table className="table">
          <tbody>
          <tr>
            <td>單位：</td>
            <td>{this.props.unit}</td>
          </tr>
          <tr>
            <td>說明：</td>
            <td>{this.props.description}</td>
          </tr>
          <tr>
            <td>資料來源：</td>
            <td>{this.props.dataSource}</td>
          </tr>
          </tbody>
        </table>
      </div>
    );
  };
}

class ContinuousChart extends React.Component {
  constructor(props) {
    super(props);
    // this.chartType = 'serial';
  };

  shouldComponentUpdate(nextProps, nextState) {
    return nextProps.feature.featureId !== this.props.feature.featureId;
  };

  componentDidMount() {
    console.log('component continuous chart did mount');
  };

  componentDidUpdate() {
    console.log('component continuous chart did update');
  };

  render() {
    let chartConfig = {
      "type": "serial",
      "theme": "light",
      "marginRight": 80,
      "autoMarginOffset": 20,
      "marginTop": 7,
      "dataProvider": this.props.chart.data,
      "valueAxes": [{
        "axisAlpha": 0.2,
        "dashLength": 1,
        "position": "left"
      }],
      "mouseWheelZoomEnabled": true,
      "graphs": [{
        "id": "g1",
        "balloonText": "[[value]]",
        "bullet": "round",
        "bulletBorderAlpha": 1,
        // "bulletColor": "#FFFFFF",
        "hideBulletsCount": 50,
        // "title": "red line",
        "valueField": "pole",
        "useLineColorForBulletBorder": true,
        "balloon":{
          "drop":true
        }
      }],
      "chartScrollbar": {
        "autoGridCount": true,
        "graph": "g1",
        "scrollbarHeight": 40
      },
      "chartCursor": {
        "limitToGraph":"g1"
      },
      "categoryField": "scale",
      "categoryAxis": {
        // "parseDates": true,
        // "axisColor": "#DADADA",
        "dashLength": 1,
        "minorGridEnabled": true
      },
      "export": {
        "enabled": true
      }
    };

    return (
      <AmCharts.React style={{ width: "100%", height: "400px" }} options={chartConfig} />
    );
  };
};

class CategoryChart extends ContinuousChart {
  render() {
    let chartConfig = {
      "type": "serial",
      "categoryField": "scale",
      "startDuration": 1,
      "categoryAxis": {
        "gridPosition": "start"
      },
      "chartCursor": {
        "enabled": true
      },
      "chartScrollbar": {
        "enabled": true
      },
      "trendLines": [],
      "graphs": [
        {
          "fillAlphas": 1,
          "id": "AmGraph-1",
          "title": "graph 1",
          "type": "column",
          "valueField": "pole"
        }
      ],
      "guides": [],
      "valueAxes": [
        {
          "id": "ValueAxis-1",
          "title": "Axis title"
        }
      ],
      "allLabels": [],
      "balloon": {},
      "titles": [
        {
          "id": "Title-1",
          "size": 15, //font size of title
          "text": this.props.selectedFeature.label
        }
      ],
      "dataProvider": this.props.chart.data
    };

    return (
      <AmCharts.React style={{ width: "100%", height: "400px" }} options={chartConfig} />
    );
  };
};

class TimelineChart extends ContinuousChart {};