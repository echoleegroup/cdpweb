import React from 'react';
import {assign} from 'lodash';
import CriteriaBase from "./CriteriaBase";

export default class IntegratedAnalysisCriteriaBase extends CriteriaBase {
  getMainTitle() {
    return '查詢條件';
  };

  getPickerProps(props, state) {
    return assign(super.getPickerProps(props, state), {
      features: state.features,
      featureRefCodeMap: state.featureRefCodeMap
    });
  };

  ComponentPreviewControlButton() {
    return (
      <div className="btn-block center-block">
        <button type="button" className="btn btn-lg btn-default" onClick={this.props.stepPrev}>上一步</button>
        <button type="button" className="btn btn-lg btn-default" onClick={this.toEdit}>編輯條件</button>
        <button type="button" className="btn btn-lg btn-default" onClick={this.props.stepNext}>下一步</button>
      </div>
    );
  };
};