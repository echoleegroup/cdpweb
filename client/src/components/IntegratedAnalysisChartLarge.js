import React from 'react';
import Loadable from 'react-loading-overlay';
import {isEmpty, assign} from 'lodash';
import Rx from "rxjs/Rx";
import AmCharts from '@amcharts/amcharts3-react';
// import BranchOfNavTree from './BranchOfNavTree';
import {getNavigateFeatures, getQueryTask, getChartData} from '../actions/integrated-analysis-action';

export class IntegratedAnalysisChartLarge extends React.PureComponent {
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
      chartData: []
    };
  };

  // shouldComponentUpdate(nextProps, nextState) {
  //   let update = (nextState.selectedFeature.size === 0 || this.state.selectedFeature !== nextState.selectedFeature);
  //   console.log('shouldComponentUpdate?: ', update);
  //   return update;
  // }

  componentWillMount() {
    this.selectFeature = (feature, ...parents) => {
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
        features: res[0],
        records: res[1].records
      });
    });
  };

  fetchChartData(mode, queryId, featureId) {
    getChartData(mode, queryId, featureId, data => {
      // console.log('get chart data: ', data);
      this.setState({
        // feature: data.feature,
        chartData: data,
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

  // ComponentFunctionBar(props) {
  //   return (
  //     <div>
  //       <h2>特徵觀察</h2>
  //       <button type="button" className="btn btn-default fa fa-search" onClick={props.doSearch}>重新查詢</button>
  //       <button type="button" className="btn btn-default fa fa-arrow-right" onClick={props.changeView}/>
  //     </div>
  //   );
  // };

  ComponentViewSwitcher(props) {
    return (<button type="button" className="btn btn-default fa fa-arrow-right" onClick={props.changeView}/>);
  }

  ComponentFeatureRow(props) {
    return (
      <tr>
        {props.children}
      </tr>
    );
  };

  // getChartContainer(category) {
  //   switch (category) {
  //     case 'continuous':
  //       return ContinuousLargeChart;
  //     case 'category':
  //       return CategoryLargeChart;
  //     case 'date':
  //       return TimelineLargeChart;
  //     default:
  //       return null;
  //   }
  // };

  ComponentChartBody(props) {
    const mapToProps = {
      chartData: props.chartData
    };
    switch (props.feature.category) {
      case 'continuous':
        return <ContinuousLargeChart {...mapToProps}/>;
      case 'category':
        return <CategoryLargeChart {...mapToProps}/>;
      case 'date':
        return <TimelineLargeChart {...mapToProps}/>;
      default:
        return <div/>;
    }
  }

  doSearch() {
    window.location.href = '/integration/query';
  };

  changeView() {
    window.location.href = `/integration/${this.mode}/query/${this.queryId}/analysis/small`;
  };

  render() {
    let ComponentLeftColumnGrid = this.ComponentLeftColumnGrid;
    let ComponentRightColumnGrid = this.ComponentRightColumnGrid;
    let ComponentViewSwitcher = this.ComponentViewSwitcher;
    let ComponentFeatureRow = this.ComponentFeatureRow;
    let ComponentChartBody = this.ComponentChartBody;

    return (
      <div className="row">
        {/*<!-- 左欄 Start -->*/}
        <ComponentLeftColumnGrid>
          {/*<!-- table set Start -->*/}
          <div className="table_block feature">
            {/*<ComponentFunctionBar doSearch={this.doSearch.bind(this)} changeView={this.changeView.bind(this)}/>*/}
            <div>
              <h2>特徵觀察</h2>
              {/*<button type="button" className="btn btn-default fa fa-search" onClick={this.doSearch}>重新查詢</button>*/}
              <ComponentViewSwitcher changeView={this.changeView.bind(this)}/>
            </div>
            {this.state.features.map(node => {
              return (
                <FeatureNavigator key={node.id} node={node}>
                  {node.children.map(tail => {
                    let cssClazz = (this.state.selectedFeature.id === tail.id)? 'active': null;
                    return (
                      <ComponentFeatureRow key={tail.id}
                                           // parentNode={node}
                                           tail={tail}
                                           // cssClazz={cssClazz}
                                           // selectedFeature={this.state.selectedFeature}
                                           // selectFeatureHandler={this.selectFeature}
                        >
                        <th>
                          <a href="javascript:;"
                             className={cssClazz}
                             onClick={(e) => {
                               this.selectFeature(tail, node);
                             }}>{tail.label}</a>
                        </th>

                      </ComponentFeatureRow>
                    );
                  })}
                </FeatureNavigator>
              );
            })}
          </div>
          {/*<ItemTreeNavigator nodes={this.state.features}*/}
          {/*selectNode={this.selectFeature}*/}
          {/*selected={this.state.selectedFeature}/>*/}
        </ComponentLeftColumnGrid>
        {/*<!-- 右欄 Start -->*/}
        <ComponentRightColumnGrid>
          <Loadable active={!this.state.isLoaded} spinner>
            <FeatureAnalysis selectedFeature={this.state.selectedFeature}
                             selectedFeaturePath={this.state.selectedFeaturePath}>
              <ComponentChartBody feature={this.state.selectedFeature}
                                  chartData={this.state.chartData}/>
            </FeatureAnalysis>
          </Loadable>
          {/*<!-- table set Start -->*/}
          <TaskDataInformation records={this.state.records} mode={this.mode} queryId={this.queryId}/>
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

  componentWillMount() {
    this.goToTaskOverview = () => {
      window.location.href = `/integration/${this.props.mode}/query/${this.props.queryId}`;
    }
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
          <button type="button" className="btn btn-lg btn-default" onClick={this.goToTaskOverview}>條件總覽</button>
        </div>
      </div>
    );
  }
}

class FeatureAnalysis extends React.PureComponent {

  ComponentFeatureInfo(props) {
    if (isEmpty(props.value)) {
      return null;
    }
    return (
      <tr>
        <td>{props.title}：</td>
        <td>{props.value}</td>
      </tr>
    );
  }

  render() {
    // let ChartContainer = this.props.chartContainer;
    // let ComponentChart = ChartContainer?
    //   <ChartContainer feature={this.props.feature}
    //                   chart={this.props.chart}
    //                   selectedFeature={this.props.selectedFeature}/>: null;
    let headline = '';
    let display = 'none';
    if (!isEmpty(this.props.selectedFeature)) {
      headline = this.props.selectedFeaturePath.reduce((title, node) => {
        return `${title}${node.label} > `;
      }, '') + this.props.selectedFeature.label;

      display = '';
    }
    let ComponentFeatureInfo = this.ComponentFeatureInfo;

    return (
      <div className="table_block table-responsive" style={{display: display}}>
        <h2>{headline}</h2>
        <h3>內容與分佈
          {/*<i flow="right" tooltip="2016年有參與汰舊換新補助的車主，車主需為自然人，且舊車需為TOYOTA"/>*/}
        </h3>
        {this.props.children}
        <table className="table">
          <tbody>
            <ComponentFeatureInfo title="單位" value={this.props.selectedFeature.unit}/>
            <ComponentFeatureInfo title="說明" value={this.props.selectedFeature.description}/>
            <ComponentFeatureInfo title="資料來源" value={this.props.selectedFeature.dataSourceLabel}/>
          </tbody>
        </table>
      </div>
    );
  };
}

export class ContinuousLargeChart extends React.PureComponent {
  constructor(props) {
    super(props);
    this.chartHeight = '400px';
    this.chartConfig = {
      "type": "serial",
      "listeners": [
        {
          "event": "dataUpdated",
          "method": (e) => {
            this.props.chartData.length > 0 && e.chart.zoomOut();
          }
        }
      ],
      "theme": "light",
      "marginRight": 80,
      "autoMarginOffset": 20,
      "marginTop": 7,
      // "dataProvider": this.props.chartData,
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
        "bulletSize": 5,
        // "bulletColor": "#FFFFFF",
        "hideBulletsCount": 50,
        // "title": "red line",
        "valueField": "peak",
        "useLineColorForBulletBorder": true,
        "balloon":{
          "drop":true
        },
        "lineColor": "#F2B530"
      }],
      "chartScrollbar": {
        "enabled": true,
        "graph": "g1",
        "offset": 5
      },
      "chartCursor": {
        "enabled": true
        // "limitToGraph":"g1",
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
  };

  // shouldComponentUpdate(nextProps, nextState) {
  //   return nextProps.feature.id !== this.props.feature.id;
  // };

  componentDidMount() {
    // console.log('component continuous chart did mount');
  };

  componentDidUpdate() {
    // console.log('component continuous chart did update');
  };

  render() {
    const config = assign({}, this.chartConfig, {
      dataProvider: this.props.chartData
    });
    return (
      <AmCharts.React style={{ width: "100%", height: this.chartHeight }} options={config} />
    );
  };
}

export class CategoryLargeChart extends ContinuousLargeChart {
  constructor(props) {
    super(props);
    this.chartConfig = {
      "type": "serial",
      "listeners": [
        {
          "event": "dataUpdated",
          "method": (e) => {
            this.props.chartData.length > 0 && e.chart.zoomOut();
          }
        }
      ],
      "categoryField": "scale",
      "startDuration": 1,
      "startEffect": "easeInSine",
      "categoryAxis": {
        "gridPosition": "start",
        "gridThickness": 0
      },
      "chartCursor": {
        "enabled": true
      },
      "chartScrollbar": {
        "enabled": true,
        "graph": "AmGraph-1",
        "offset": 5
      },
      "trendLines": [],
      "graphs": [
        {
          "fillColors": "#F2B530",
          "lineColor": "#F2B530",
          "fillAlphas": 1,
          "id": "AmGraph-1",
          "title": "graph 1",
          "type": "column",
          "valueField": "peak"
        }
      ],
      "guides": [],
      "valueAxes": [],
      "allLabels": [],
      "balloon": {},
      "titles": [],
      // "dataProvider": this.props.chart.data
    };
  };

  render() {
    const config = assign({}, this.chartConfig, {
      dataProvider: this.props.chartData
    });
    // this.chartConfig.titles.text = this.props.selectedFeature.label;
    return (
      <AmCharts.React style={{ width: "100%", height: this.chartHeight }} options={config} />
    );
  };
}

export class TimelineLargeChart extends ContinuousLargeChart {
  constructor(props) {
    super(props);
    this.chartConfig.categoryAxis.parseDates = true;
    this.chartConfig.categoryAxis.dateFormats = [
      {period:'fff',format:'JJ:NN:SS'},
      {period:'ss',format:'JJ:NN:SS'},
      {period:'mm',format:'JJ:NN'},
      {period:'hh',format:'JJ:NN'},
      {period:'DD',format:'MM/DD'},
      {period:'WW',format:'MM/DD'},
      {period:'MM',format:'MM'},
      {period:'YYYY',format:'YYYY'}]
  };
}

export class FeatureNavigator extends React.PureComponent {
  componentWillMount() {
    this.branchClickHandler = (e) => {
      let _this = e.currentTarget;
      $(_this).children('i').toggleClass('fa-minus');
      $(_this).next('.subtable').slideToggle();
    };

    // this.tailClickHandler = (parentNode, currNode) => {
    //   this.props.selectNode(currNode, parentNode);
    // };
  };

  // ComponentFeatureRow(props) {
  //   return (
  //     <tr>
  //       <th>
  //         <a href="javascript:;"
  //            className={props.cssClass}
  //            onClick={props.tailClickHandler}>{props.item.label}</a>
  //       </th>
  //     </tr>
  //   );
  // };

  render() {
    let node = this.props.node;
    // let ComponentFeatureRow = this.ComponentFeatureRow;
    return (
      <div>
        <h3 onClick={this.branchClickHandler}>
          {node.label}
          <span className="number">{node.children.length}</span>
          <i className="fa fa-plus" aria-hidden="true"/>
        </h3>
        <div className="table-responsive subtable" style={{display: 'none'}}>
          <table className="table table-hover table-striped table-condensed">
            <tbody>
            {this.props.children}
            </tbody>
          </table>
        </div>
      </div>
    );
  }
}