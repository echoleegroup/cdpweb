import React from 'react';
import {assign} from 'lodash';
import IntegratedAnalysisAction from "../actions/integrated-analysis-action";
import IntegratedAnalysisCriteriaBase from "./IntegratedAnalysisCriteriaBase";

export default class IntegratedAnalysisCriteriaClient extends IntegratedAnalysisCriteriaBase {
  constructor(props) {
    super(props);
  };

  getMainTitle() {
    return '查詢條件';
  };

  getSubTitle() {
    return '第一步 挑選顧客屬性資料';
  };

  dataPreparing(props, _this, callback) {
    IntegratedAnalysisAction.getClientCriteriaFeatures(callback);
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
        <button type="button" className="btn btn-lg btn-default" onClick={this.toEdit}>編輯條件</button>
        <button type="button" className="btn btn-lg btn-default" onClick={this.props.stepNext}>下一步</button>
      </div>
    );
  };
};