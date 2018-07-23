import React from 'react';
import Loadable from 'react-loading-overlay';
import {List} from 'immutable';
import { Modal, Button } from 'react-bootstrap';
import {xorBy, map} from 'lodash';
import {NODE_TYPE_DICT as NODE_TYPE} from '../utils/tree-node-util';
import PickerMultiple from './PickerMultiple';
import {exportQuery} from '../actions/integrated-analysis-action';
import AlertMessenger from './AlertMessenger';
import 'flatpickr/dist/themes/material_green.css';
import Flatpickr from 'react-flatpickr';

const extractAllNode = (nodes) => {
  return nodes.reduce((accumulator, node) => {
    switch (node.type) {
      case NODE_TYPE.Branch:
        return accumulator.concat(extractAllNode(node.children));
      case NODE_TYPE.Tail:
        accumulator.push(node);
        return accumulator;
    }
  }, []);
};

const toggleList = (target, selected) => {
  // console.log('toggleList target: ', target);
  return xorBy([target], selected, 'id');
};

export default class IntegratedCriteriaExportFeaturePicker extends React.PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      periodStart: props.output.periodStart,
      periodStartLabel: props.output.periodStartLabel,
      periodEnd: props.output.periodEnd,
      periodEndLabel: props.output.periodEndLabel,
      selectedFeature: props.output.selectedFeature,
      selectedRelative: props.output.selectedRelative,
      queryId: undefined,
      message_error: undefined,
      showModal: false,
      isLoaded: true
    };

  };

  componentWillMount() {

    this.selectAllFeatureHandler = () => {
      let allNode = extractAllNode(this.props.featureOptions);
      this.setState({
        selectedFeature: List(allNode)
      });
    };

    this.deselectAllHandler = () => {
      this.setState({
        selectedFeature: List()
      });
    };

    this.featureTailClickHandler = (node) => {
      this.setState(prevState => ({
        selectedFeature: List(toggleList(node, prevState.selectedFeature.toJS()))
      }));
    };

    this.relativeTailClickHandler = (node) => {
      this.setState(prevState => ({
        selectedRelative: List(toggleList(node, prevState.selectedRelative.toJS()))
      }));
    };

    this.getExportOutputConfig = () => {
      return this.state;
    };

    this.processPostDate = (e) => {
      this.props.pageLoading();

      let criteria = this.props.criteria.toJS();
      let selectedFeatures = this.state.selectedFeature.toJS();
      let selectedRelativeSets = this.state.selectedRelative.toJS();

      let formDate = {
        criteria,
        export: {
          master: map(selectedFeatures, 'id'),
          relatives: map(selectedRelativeSets, 'id')
        },
        filter: {
          relatives: {
            period_start_value: this.state.periodStart,
            period_start_label: this.state.periodStartLabel,
            period_end_value: this.state.periodEnd,
            period_end_label: this.state.periodEndLabel
          }
        }
      };

      exportQuery(formDate, res => {
        this.setState({
          queryId: res.queryId,
          mode: res.mode,
          showModal: true,
          message_error: undefined
        }, this.props.pageUnloading);
      }, err => {
        this.setState({
          message_error: '搜尋失敗，請稍後再試或聯絡相關人員',
          showModal: false
        }, this.props.pageUnloading);
      });
    };

    this.modalOnHideHandler = (e) => {
      this.setState({
        showModal: false
      });
    };
  };

  render() {
    return (
      <div className="table_block">
        <h2>查詢條件</h2>
        <h3>第七步 挑選下載欄位</h3>
        <h4>挑選下載欄位</h4>
        <div className="btn-block text-left">
          <button type="button" className="btn btn-sm btn-default" onClick={this.selectAllFeatureHandler}>全選</button>
          <button type="button" className="btn btn-sm btn-default" onClick={this.deselectAllHandler}>全不選</button>
        </div>
        <PickerMultiple nodes={this.props.featureOptions}
                        collapse={false}
                        selected={this.state.selectedFeature.toJS()}
                        tailClickHandler={this.featureTailClickHandler}/>
        <h4>挑選下載明細資訊</h4>
        <div className="form-group">
          <label htmlFor="inputName" className="col-sm-3 control-label form-inline">明細時間區間</label>
          <div className="col-sm-7">
            <div className="form-inline">
              <Flatpickr options={{
                dateFormat: "Y/m/d",
                defaultDate: new Date(this.state.periodStart),
                onChange: (selectedDates, dateStr) => {
                  this.setState({
                    periodStart: selectedDates[0].getTime(),
                    periodStartLabel: dateStr
                  });
                }
              }}/>
              <span> ~ </span>
              <Flatpickr options={{
                dateFormat: "Y/m/d",
                defaultDate: new Date(this.state.periodEnd),
                onChange: (selectedDates, dateStr) => {
                  this.setState({
                    periodEnd: selectedDates[0].getTime(),
                    periodEndLabel: dateStr
                  });
                }
              }}/>
            </div>
          </div>
        </div>
        <PickerMultiple nodes={this.props.relativeSetOptions}
                        selected={this.state.selectedRelative.toJS()}
                        tailClickHandler={this.relativeTailClickHandler}/>
        {/*<!-- error -->*/}
        <AlertMessenger message_error={this.state.message_error}/>
        <div className="btn-block center-block">
          {/*<button type="submit" className="btn btn-lg btn-default">重新挑選客群</button>*/}
          <button type="button"
                  className="btn btn-lg btn-default"
                  onClick={this.processPostDate}
                  disabled={this.state.queryId || this.state.selectedFeature.size === 0}>下載資料</button>
        </div>


        {/*<!-- Modal -->*/}
        <Modal show={this.state.showModal} bsSize="large" backdrop onHide={this.modalOnHideHandler} >
          <Modal.Header closeButton/>
          <Modal.Body>
            <p>查詢正在進行中，請稍候片刻。</p>
            <p>您可隨時檢視<Button bsStyle="link" href={"/integration/"+this.state.mode+"/query/"+this.state.queryId} target="_blank">查詢結果</Button>，或等候E-mail通知</p>
          </Modal.Body>
        </Modal>
      </div>
    );
  };
};