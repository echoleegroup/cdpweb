import React from 'react';
import {map} from 'lodash';
import {List} from 'immutable';
import IntegratedAnalysisAction from "../actions/integrated-analysis-action";
import CriteriaTransactionBundle from "./CriteriaTransactionBundle";
import TagPickerModal from "./TagPickerModal";

const OPERATOR_OPTIONS =  {
  or: '任一'
};
export default class CriteriaTagBundle extends CriteriaTransactionBundle {
  constructor(props) {
    super(props);
    this.OPERATOR_OPTIONS = OPERATOR_OPTIONS;
    this.BUNDLE_TYPE_LABEL = '標籤條件';
    // state from super:
    // this.state = {
    //   isLoaded: true,
    //   properties: Map(this.getBundleProperties(props.criteria))
    // };
    // this.state = assign(this.state, {
    //   // isLoaded: false,
    //   features: [],
    //   featureRefCodeMap: {}
    // });
  };

  componentWillMount() {
    super.componentWillMount();

    // this.pickerOptionFilter = (keyword, callback) => {
    //   // console.log('pickerOptionFilter');
    //   this.fetchFeatureData(keyword, callback);
    // };

    this.insertCriteriaState = (tagList) => {
      // console.log('CriteriaTagBundle:insertCriteriaState: ', tagList);
      this.setState(prevState => ({
        properties: prevState.properties.set('criteria', List(tagList))
      }));
    };

    this.fetchFeatureData = (keyword, callback) => {
      IntegratedAnalysisAction.getTagCriteriaFeatures(
        this.getPropertyState('ref'), keyword, callback);
    };
  };

  fetchPreparedData() {
    //do nothing
  };
  //
  // componentWillUnmount() {
  //   console.log('CriteriaTransactionBundle: componentWillUnmount', this.state);
  //   super.componentWillUnmount()
  // };

  // render() {
  //   // console.log('CriteriaTransactionBundle render');
  //   return super.render();
  // };

  // addCriteriaClickHandler() {
  //   this.slaveModal.openModal(this.insertCriteriaState);
  // };

  // ComponentBundleBodyTail(props) {
  //   return (
  //     <div className="sub_conditon">
  //       指定參考：<span>{props.criteria.ref_label}</span>
  //     </div>
  //   );
  // };

  // ComponentBundleBodyTail(props) {
  //   return (
  //     <div className="sub_conditon">
  //       來源：<span>{props.criteria.ref_label}</span>
  //     </div>
  //   );
  // };

  ComponentCustomized(props) {
    let mapToProps = {
      title: this.getPropertyState('ref_label'),
      dataHandler: this.fetchFeatureData,
      selected: map(this.state.properties.get('criteria').toJS(), 'value')
      // dataHandler: this.pickerOptionFilter,
      // loaded: this.state.isLoaded
      // features: this.state.features || [],
      // featureRefCodeMap: this.state.featureRefCodeMap || {}
    };
    return (
      <TagPickerModal {...mapToProps} ref={(e) => {
        this.slaveModal = e;
      }}/>
    );
  };

  ComponentChildCriteriaBlock(props) {
    return (
      <div className="level form-inline">
        <div className="con-option">
          <div className="tag customize">
            <ul>
              {this.state.properties.get('criteria').map((_criteria, index) => {
                return this.ComponentChildCriteria(_criteria, index);
              })}
            </ul>
          </div>
        </div>
      </div>
    );
  };

  ComponentButtonInsertCriteria(props) {
    if (!props.isPreview) {
      return (
        <div className="add_condition">{/*<!-- 加條件 條件組合 -->*/}
          <button type="button" className="btn btn-warning" onClick={props.addCriteriaClickHandler}>
            <i className="fa fa-plus" aria-hidden="true"/>加標籤
          </button>
        </div>
      );
    } else {
      return null;
    }
  };
};