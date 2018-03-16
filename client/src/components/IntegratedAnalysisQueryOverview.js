import React from 'react';
import {map as _map} from 'lodash';
import {Map, List} from 'immutable';
import moment from 'moment';
import filesize from 'filesize';
import integratedAction from '../actions/integrated-analysis-action';
import CriteriaComboBundleMute from "./CriteriaComboBundleMute";
import CriteriaBaseBodyContainerMute from './CriteriaBaseBodyContainerMute';

const getQueryTask = (queryId, callback) => {
  integratedAction.getQueryTask(queryId, callback)
};

export default class IntegratedAnalysisQueryOverview extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      task: Map({
        status: null,
        statusLabel: undefined,
        queryTime: null,
        fileSize: null,
        entries: [],
        records: undefined
      }),
      criteria: Map()
    };
  };

  componentWillMount() {
    getQueryTask(this.props.match.params.queryId, (queryTask) => {
      this.setState({
        task: Map({
          status: queryTask.status,
          statusLabel: queryTask.statusLabel,
          queryTime: moment(queryTask.crtTime).valueOf(),
          fileSize: queryTask.archiveSizeInBytes,
          entries: queryTask.archiveEntries,
          records: queryTask.records
        }),
        criteria: Map(queryTask.criteria)
      });
    });
  }

  render() {
    let task = this.state.task.toJS();
    let criteria = this.state.criteria.toJS();
    return (
      <div className="container">
        {/*<!-- row div 於需要分兩欄才需要 -->*/}
        <div className="row">
          {/*<!-- 左欄 Start -->*/}
          <div className="col-md-8 col-sm-7 col-xs-12">
            <QueryTask task={task} queryId={this.props.match.params.queryId}/>
            <CriteriaOverview criteria={criteria}/>
          </div>
          <div className="col-md-4 col-sm-5 col-xs-12">
            <ResultInfo task={task}/>
            <ResultContent task={task}/>
          </div>
        </div>
      </div>
    );
  };
};

class QueryTask extends React.PureComponent {
  componentWillMount() {
    this.download = () => {
      const downloadjs = require("downloadjs");
      const queryId = this.props.queryId;
      downloadjs('/api/integration/export/download/' + queryId, queryId + '.zip');
    };
  };

  render() {
    return (
      <div className="form_block">{/*<!-- form set Start -->*/}
        <h2>數據導出</h2>
        <form className="form-horizontal">
          <div className="form-group">
            <label htmlFor="inputName" className="col-sm-3 control-label">查詢送出時間</label>
            <div className="col-sm-8">
              <input type="text" className="form-control " id="inputName" value={moment(this.props.task.queryTime).format('YYYY/MM/DD HH:mm:ss')} placeholder="" readOnly={true}/>
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="inputName" className="col-sm-3 control-label">狀態</label>
            <div className="col-sm-8">
              <input type="text" className="form-control " id="inputName" value={this.props.task.statusLabel} placeholder="" readOnly={true}/>
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="inputName" className="col-sm-3 control-label">資料檔案大小</label>
            <div className="col-sm-8">
              <input type="text" className="form-control " id="inputName" value={filesize(this.props.task.fileSize)} placeholder="" readOnly={true}/>
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="inputName" className="col-sm-3 control-label">包含檔案數</label>
            <div className="col-sm-8">
              <input type="text" className="form-control " id="inputName" value={this.props.task.entries.length} placeholder="" readOnly={true}/>
            </div>
          </div>
        </form>
        <div className="btn-block center-block">
          <button type="button" className="btn btn-lg btn-default" onClick={this.download} disabled={'COMPLETE' !== this.props.task.status}>下載檔案</button>
        </div>
      </div>
    );
  };
}

class CriteriaOverview extends React.PureComponent {
  render() {
    return (
      <div className="table_block">{/*<!-- form set Start -->*/}
        <h2>查詢條件總覽</h2>
        <div className="table-responsive">
          <h3>顧客屬性條件</h3>
          <CriteriaBaseBodyContainerMute criteria={this.props.criteria.client}
                                         ComponentCriteriaBundleContainer={CriteriaComboBundleMute}/>
          <h3>車輛屬性標籤篩選條件</h3>
          <CriteriaBaseBodyContainerMute criteria={this.props.criteria.vehicle}
                                         ComponentCriteriaBundleContainer={CriteriaComboBundleMute}/>
          <h3>車輛屬性標籤篩選條件</h3>
          <CriteriaBaseBodyContainerMute criteria={this.props.criteria.transaction}
                                         ComponentCriteriaBundleContainer={CriteriaComboBundleMute}/>
        </div>
      </div>
    );
  };
}

class ResultInfo extends React.PureComponent {
  render() {
    return (
      <div className="table_block">
        <h2>觀察客群</h2>
        <div className="info">
          <div className="table-responsive">
            <table className="table">
              <tbody>
              <tr>
                <td>觀察車牌數：</td>
                <td>{this.props.task.records}</td>
              </tr>
              </tbody>
            </table>
          </div>
          <div className="btn-block">
            <a className="btn btn-default btn-lg" href="#">客戶樣貌總覽</a>
          </div>
        </div>
      </div>
    );
  }
}

class ResultContent extends React.PureComponent {
  render() {
    return (
      <div className="table_block">
        <h2>資料檔案清單</h2>
        <div className="info">
          <h3>檔名</h3>
          <div className="table-responsive">
            <table className="table">
              <tbody>
              {_map(this.props.task.entries, entry => {
                return (
                  <tr key={entry}>
                    <td><a href="#">{entry}</a></td>
                  </tr>
                );
              })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };
}