import React from 'react';
import IntegratedAnalysisCriteriaBase from "./IntegratedAnalysisCriteriaBase";
import IntegratedAnalysisAction from "../actions/integrated-analysis-action";

export default class IntegratedAnalysisCriteriaVehicle extends IntegratedAnalysisCriteriaBase {
  constructor(props) {
    super(props);
  };

  subheadText() {
    return '第二步 挑選車輛屬性資料';
  };

  fetchPreparedData(props, _this, callback) {
    IntegratedAnalysisAction.getVehicleCriteriaFeatures(callback);
  };
};