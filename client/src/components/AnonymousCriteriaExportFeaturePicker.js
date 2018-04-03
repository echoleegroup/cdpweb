import React from 'react';
import {List} from 'immutable';
import { Modal, Button, Alert } from 'react-bootstrap';
import {xorBy, map} from 'lodash';
import {NODE_TYPE_DICT as NODE_TYPE} from '../utils/tree-node-util';
import PickerMultiple from './PickerMultiple';
import {exportAnonymousQuery} from '../actions/anonymous-analysis-action';
import AlertMessenger from './AlertMessenger';
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

export default class AnonymousCriteriaExportFeaturePicker extends React.PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      selectedFeature: props.output.selectedFeature,
      queryId: undefined,
      message_error: undefined,
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

    this.getExportOutputConfig = () => {
      return this.state;
    };

    this.processPostDate = (e) => {
      let criteria = this.props.criteria.toJS();
      let selectedFeatures = this.state.selectedFeature.toJS();
      // let selectedRelativeSets = this.state.selectedRelativeId.toJS();

      let formDate = {
        criteria,
        export: {
          master: map(selectedFeatures, 'id'),
          relatives: []
        },
        filter: {
          relatives: {}
        }
      };

      exportAnonymousQuery(formDate, res => {
        this.setState({
          queryId: res.queryId,
          showModal: true,
          message_error: undefined
        });
      }, err => {
        this.setState({
          message_error: '搜尋失敗，請稍後再試或聯絡相關人員',
          showModal: false
        });
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
            <p>您可隨時檢視<Button bsStyle="link" href={"/integration/query/"+this.state.queryId} target="_blank">查詢結果</Button>，或等候E-mail通知</p>
          </Modal.Body>
        </Modal>
      </div>
    );
  };
};