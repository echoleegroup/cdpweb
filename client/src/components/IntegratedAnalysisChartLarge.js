import React from 'react';
import Loader from 'react-loader';
import {withRouter} from 'react-router-dom';
import {isEmpty} from 'lodash';
import Rx from "rxjs/Rx";
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
      isLoaded: false
    };
  };

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
    // getNavigateFeatures(this.queryId, this.mode, data => {
    //   this.setState({
    //     features: data.features
    //   });
    // });
  };

  fetchChartData(mode, queryId, featureId) {
    getChartData(mode, queryId, featureId, data => {
      console.log('get chart data: ', data);
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
    let ComponentDataSetInformation = this.ComponentDataSetInformation;
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
          <Chart isLoaded={this.state.isLoaded}
                 selectedFeature={this.state.selectedFeature}
                 selectedFeaturePath={this.state.selectedFeaturePath}/>
          {/*<!-- table set Start -->*/}
          <div className="table_block table-responsive" id="">
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

class Chart extends React.PureComponent {

  render() {
    let headline = this.props.selectedFeaturePath.reduce((title, node) => {
      return `${title}${node.label} > `;
    }, '') + this.props.selectedFeature.label;

    let display = isEmpty(this.props.selectedFeature)? 'none': '';

    return (
      <div className="table_block table-responsive " id="sampleChart" style={{display: display}}>
        <h2>{headline}</h2>
        <h3>內容與分佈<i flow="right" tooltip="2016年有參與汰舊換新補助的車主，車主需為自然人，且舊車需為TOYOTA"/></h3>
        <div className="chart_block">
          <Loader loaded={this.props.isLoaded}>
            <iframe className="chartjs-hidden-iframe" tabIndex="-1" style={{
              display: '',
              overflow: 'hidden',
              border: '0px',
              margin: '0px',
              top: '0px',
              left: '0px',
              right: '0px',
              bottom: '0px',
              height: '100%',
              width: '100%',
              position: 'absolute',
              pointerEvents: 'none',
              zIndex: -1
            }}/>
            <canvas id="skillsChart" width="500" height="250" style={{
              display: '',
              height: '125px',
              width: '250px'
            }}/>
          </Loader>
        </div>
        <table className="table">
          <tbody><tr>
            <td>資料來源：</td>
            <td>ECHO</td>
          </tr>
          <tr>
            <td>更新日期：</td>
            <td>2017/03/05 01:00:05</td>
          </tr>
          </tbody></table>
      </div>
    );
  };
};