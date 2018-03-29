import React from 'react';
import {List} from 'immutable';
import { Modal, Button, Alert } from 'react-bootstrap';
import {xorBy, map} from 'lodash';
import {NODE_TYPE_DICT as NODE_TYPE} from '../utils/tree-node-util';
import PickerMultiple from './PickerMultiple';
import anonymousAction from '../actions/anonymous-analysis-action';
import 'flatpickr/dist/themes/material_green.css';

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

const toggleList = (target={}, selected=[]) => {
  // console.log('toggleList target: ', target);
  return xorBy([target], selected, 'id');
};

export default class AnonymousAnalysisOutputFeaturePicker extends React.PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      // featureOptions: fromJS(props.outputFeatures.featureOptions),
      // relativeSetOptions: fromJS(props.outputFeatures.relativeSetOptions),
      // periodStart: props.output.periodStart,
      // periodStartLabel: props.output.periodStartLabel,
      // periodEnd: props.output.periodEnd,
      // periodEndLabel: props.output.periodEndLabel,
      selectedFeature: props.output.selectedFeature,
      // selectedRelativeId: props.output.selectedRelativeId,
      queryId: undefined,
      showError: false,
      showModal: false
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

    // this.relativeTailClickHandler = (node) => {
    //   this.setState(prevState => ({
    //     selectedRelativeId: List(toggleList(node.id, prevState.selectedRelativeId.toJS()))
    //   }));
    // };

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
      let selectedFeatures = this.state.selectedFeature.toJS();
      // let selectedRelativeSets = this.state.selectedRelativeId.toJS();

      let formDate = {
        mod: 'anonymous',
        criteria,
        export: {
          master: map(selectedFeatures, 'id'),
          relatives: []
        },
        filter: {
          relatives: {
            // period_start_value: this.state.periodStart,
            // period_start_label: this.state.periodStartLabel,
            // period_end_value: this.state.periodEnd,
            // period_end_label: this.state.periodEndLabel
          }
        }
      };

      anonymousAction.exportAnonymousQuery(formDate, res => {
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
        <h3>第四步 挑選下載欄位</h3>
        <h4>挑選下載欄位</h4>
        <div className="btn-block text-left">
          <button type="button" className="btn btn-sm btn-default" onClick={this.selectAllFeatureHandler}>全選</button>
          <button type="button" className="btn btn-sm btn-default" onClick={this.deselectAllHandler}>全不選</button>
        </div>
        <PickerMultiple nodes={this.props.featureOptions}
                        collapse={false}
                        selected={this.state.selectedFeature.toJS()}
                        tailClickHandler={this.featureTailClickHandler}/>
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