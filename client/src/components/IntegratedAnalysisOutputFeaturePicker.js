import React from 'react';
import {fromJS, List} from 'immutable';
import { Modal, Button, Alert } from 'react-bootstrap';
import {xor} from 'lodash';
import {NODE_TYPE_DICT as NODE_TYPE} from '../utils/tree-node-util';
import PickerMultiple from './PickerMultiple';
import integratedAction from '../actions/integrated-analysis-action';
import 'flatpickr/dist/themes/material_green.css';
import Flatpickr from 'react-flatpickr';

const extractAllNodeId = (nodes) => {
  return nodes.reduce((accumulator, node) => {
    switch (node.type) {
      case NODE_TYPE.Branch:
        return accumulator.concat(extractAllNodeId(node.children));
      case NODE_TYPE.Tail:
        accumulator.push(node.id);
        return accumulator;
    }
  }, []);
};

const toggleList = (id, target) => {
  // console.log('toggleList target: ', target);
  return xor(target, [id]);
};

export default class IntegratedAnalysisFeaturePicker extends React.PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      // featureOptions: fromJS(props.outputFeatures.featureOptions),
      // relativeSetOptions: fromJS(props.outputFeatures.relativeSetOptions),
      periodStart: props.output.periodStart,
      periodStartLabel: props.output.periodStartLabel,
      periodEnd: props.output.periodEnd,
      periodEndLabel: props.output.periodEndLabel,
      selectedFeatureId: props.output.selectedFeatureId,
      selectedRelativeId: props.output.selectedRelativeId,
      queryId: undefined,
      showError: false,
      showModal: false
    };

  };

  componentWillMount() {

    this.selectAllFeatureHandler = () => {
      let allNodeId = extractAllNodeId(this.props.featureOptions);
      this.setState({
        selectedFeatureId: List(allNodeId)
      });
    };

    this.deselectAllHandler = () => {
      this.setState({
        selectedFeatureId: List()
      });
    };

    this.featureTailClickHandler = (node) => {
      this.setState(prevState => ({
        selectedFeatureId: List(toggleList(node.id, prevState.selectedFeatureId.toJS()))
      }));
    };

    this.relativeTailClickHandler = (node) => {
      this.setState(prevState => ({
        selectedRelativeId: List(toggleList(node.id, prevState.selectedRelativeId.toJS()))
      }));
    };

    // this.initDatePicker = (dom, timestampPropsOfState, labelPropsOfState) => {
    //   $(dom).datepicker({
    //     format: 'yyyy/mm/dd'
    //   }).datepicker('setDate', new Date(this.state[timestampPropsOfState]))
    //     .datepicker('onClose', (dateText, picker) => {
    //       let data = getDate(picker.datepicker('getDate'));
    //       this.setState({
    //         [timestampPropsOfState]: data.value,
    //         [labelPropsOfState]: data.value_label
    //       });
    //     });
    // };

    this.getExportOutputConfig = () => {
      return this.state;
    };

    this.processPostDate = (e) => {
      let criteria = this.props.criteria.toJS();
      let selectedFeatures = this.state.selectedFeatureId.toJS();
      let selectedRelativeSets = this.state.selectedRelativeId.toJS();

      let formDate = {
        criteria,
        export: {
          master: selectedFeatures,
          relatives: selectedRelativeSets
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

      integratedAction.exportQuery(formDate, res => {
        this.setState({
          queryId: res.queryId,
          showModal: true,
          showError: false
        });
        // window.alert('The acquirement is in processing. System would send e-mail when things get ready.');
      }, err => {
        this.setState({
          showError: true,
          showModal: false
        });
        // window.alert('The service is temporarily unavailable. Please try latter again contact us.');
      });

      // $(this.inputCriteria).val(JSON.stringify(formDate));
      // $(this.formComponent).submit();
    };

    this.modalOnHideHandler = (e) => {
      this.setState({
        showModal: false
      });
    };
  };

  componentDidMount() {
    // $(this.successModal).modal({
    //   show: false
    // });
    // this.initDatePicker(this.periodStart, 'periodStart', 'periodStartLabel');
    // this.initDatePicker(this.periodEnd, 'periodEnd', 'periodEndLabel');
  };

  render() {
    return (
      <div className="table_block feature">
        <h2>查詢條件</h2>
        <h3>第七步 挑選下載欄位</h3>
        <h4>挑選下載欄位</h4>
        <div className="btn-block text-left">
          <button type="button" className="btn btn-sm btn-default" onClick={this.selectAllFeatureHandler}>全選</button>
          <button type="button" className="btn btn-sm btn-default" onClick={this.deselectAllHandler}>全不選</button>
        </div>
        <PickerMultiple nodes={this.props.featureOptions}
                        collapse={false}
                        selectedId={this.state.selectedFeatureId.toJS()}
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
                        selectedId={this.state.selectedRelativeId.toJS()}
                        tailClickHandler={this.relativeTailClickHandler}/>
        <div className="btn-block center-block">
          {/*<button type="submit" className="btn btn-lg btn-default">重新挑選客群</button>*/}
          <button type="button" className="btn btn-lg btn-default" onClick={this.processPostDate} disabled={this.state.queryId}>下載資料</button>
        </div>


        {/*<!-- Modal -->*/}
        <Modal show={this.state.showModal} bsSize="large" backdrop onHide={this.modalOnHideHandler} >
          <Modal.Header closeButton/>
          <Modal.Body>
            <p>查詢正在進行中，請稍候片刻。</p>
            <p>您可隨時檢視<Button bsStyle="link" href={"/integration/query/"+this.state.queryId} target="_blank">查詢結果</Button>，或等候E-mail通知</p>
          </Modal.Body>
        </Modal>

        {/*<!-- error -->*/}
        <div style={{display: (this.state.showError? '': 'none')}}>
          <Alert bsStyle="danger">
            <p>搜尋失敗，請稍後再試或聯絡相關人員</p>
          </Alert>
        </div>
      </div>
    );
  };
};