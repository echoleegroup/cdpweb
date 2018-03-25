import React from 'react';
import {map} from 'lodash';
import IntegratedAnalysisAction from "../actions/integrated-analysis-action";
import CriteriaTagBundle from "./CriteriaTagBundle";
import TrailHitPickerModal from "./TrailHitPickerModal";

const OPERATOR_OPTIONS =  {
  and: '全部',
  or: '任一'
};
export default class CriteriaTrailHitBundle extends CriteriaTagBundle {
  constructor(props) {
    super(props);
    // this.OPERATOR_OPTIONS = OPERATOR_OPTIONS;
    this.BUNDLE_TYPE_LABEL = '線上足跡';
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
    //
    // this.insertCriteriaState = (tagList) => {
    //   console.log('CriteriaTagBundle:insertCriteriaState: ', tagList);
    //   this.setState(prevState => ({
    //     properties: prevState.properties.set('criteria', tagList)
    //   }));
    // };

    this.fetchFeatureData = (keyword, periodStart, periodEnd, callback) => {
      IntegratedAnalysisAction.getTrailHitCriteriaFeatures(
        this.getPropertyState('ref'), keyword, periodStart, periodEnd, callback);
    };
  };

  fetchPreparedData() {
    // do nothing
  };

  // addCriteriaClickHandler() {
  //   this.slaveModal.openModal(this.insertCriteriaState);
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
      <TrailHitPickerModal {...mapToProps} ref={(e) => {
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
            <i className="fa fa-plus" aria-hidden="true"/>加條件
          </button>
        </div>
      );
    } else {
      return null;
    }
  };
};