import React from 'react';
import {map} from 'lodash';
import {getTrailHitCriteriaFeatures} from "../actions/integrated-analysis-action";
import CriteriaBundleTag from "./CriteriaBundleTag";
import ModalTrailHitPicker from "./ModalTrailHitPicker";

const OPERATOR_OPTIONS =  {
  and: '全部',
  or: '任一'
};
export default class CriteriaBundleTrailHit extends CriteriaBundleTag {
  constructor(props) {
    super(props);
    // this.OPERATOR_OPTIONS = OPERATOR_OPTIONS;
    this.BUNDLE_TYPE_LABEL = '線上足跡';
  };

  componentWillMount() {
    super.componentWillMount();

    this.fetchFeatureData = (keyword, periodStart, periodEnd, callback) => {
      getTrailHitCriteriaFeatures(
        this.getPropertyState('ref'), keyword, periodStart, periodEnd, callback);
    };
  };

  fetchPreparedData() {
    // do nothing
  };

  ComponentCustomized(props) {
    let mapToProps = {
      title: this.getPropertyState('ref_label'),
      dataHandler: this.fetchFeatureData,
      selected: map(this.state.properties.get('criteria').toJS(), 'value')
    };
    return (
      <ModalTrailHitPicker {...mapToProps} ref={(e) => {
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