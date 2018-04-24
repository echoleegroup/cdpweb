import React from 'react';
import Loader from 'react-loader';
import {Map} from 'immutable';
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
      isLoaded: false,
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

    this.ComponentChart = (props) => {
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

  ComponentDataSetInformation(props) {
    return (
      <table className="table">
        <tbody>
        <tr>
          <th>觀察顧客數：</th>
          <td>{props.records || 0}</td>
        </tr>
        </tbody>
      </table>
    );
  };

  render() {
    let headline = '';
    let display = 'none';
    if (!isEmpty(this.state.selectedFeature)) {
      headline = this.state.selectedFeaturePath.reduce((title, node) => {
        return `${title}${node.label} > `;
      }, '') + this.state.selectedFeature.label;

      display = '';
    }

    let ComponentDataSetInformation = this.ComponentDataSetInformation;
    let ComponentChart = this.ComponentChart;
    // let ComponentChart = this.getChartComponent(this.state.chart.category);
    // let ComponentChartInst = ComponentChart?
    //   <ComponentChart isLoaded={this.state.isLoaded}
    //                   selectedFeature={this.state.selectedFeature.toJS()}
    //                   selectedFeaturePath={this.state.selectedFeaturePath}
    //                   chart={this.state.chart}/>: null;
    return (
      <div className="row">
        {/*<!-- 左欄 Start -->*/}
        <div className="col-md-3 col-sm-4 col-xs-12">
          {/*<!-- table set Start -->*/}
          <ItemTreeNavigator nodes={this.state.features}
                             selectNode={this.selectFeature}
                             selected={this.state.selectedFeature}/>
        </div>
        {/*<!-- 右欄 Start -->*/}
        <div className="col-md-9 col-sm-8 col-xs-12">
          <div className="table_block table-responsive" style={{display: display}}>
            <h2>{headline}</h2>
            <h3>內容與分佈
              {/*<i flow="right" tooltip="2016年有參與汰舊換新補助的車主，車主需為自然人，且舊車需為TOYOTA"/>*/}
            </h3>
            <Loader loaded={this.state.isLoaded}>
              <ComponentChart feature={this.state.feature} chart={this.state.chart} selectedFeature={this.state.selectedFeature}/>
            </Loader>
            <table className="table">
              <tbody>
              <tr>
                <td>單位：</td>
                <td>{this.state.unit}</td>
              </tr>
              <tr>
                <td>說明：</td>
                <td>{this.state.description}</td>
              </tr>
              <tr>
                <td>資料來源：</td>
                <td>{this.state.dataSource}</td>
              </tr>
              </tbody>
            </table>
          </div>
          {/*<!-- table set Start -->*/}
          <div className="table_block table-responsive">
            <h2>客群資訊</h2>
            <div className="table-responsive">
              <ComponentDataSetInformation records={this.state.records}/>
            </div>
            <div className="btn-block center-block">
              <button type="button" className="btn btn-lg btn-default">條件總覽</button>
            </div>
          </div>
        </div>
      </div>
    );
  };
};

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