import React from 'react';
import IntegratedAnalysisAction from "../actions/integrated-analysis-action";
import IntegratedAnalysisCriteriaBase from "./IntegratedAnalysisCriteriaBase";

export default class IntegratedAnalysisCriteriaClient extends IntegratedAnalysisCriteriaBase {
  constructor(props) {
    super(props);
  };

  subheadText() {
    return '第一步 挑選顧客屬性資料';
  };

  fetchPreparedData(props, _this, callback) {
    IntegratedAnalysisAction.getClientCriteriaFeatures(callback);
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