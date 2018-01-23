import React from 'react';
import {assign} from 'lodash';
import IntegratedAnalysisCriteriaBase from "./IntegratedAnalysisCriteriaBase";
import IntegratedAnalysisAction from "../actions/integrated-analysis-action";

export default class IntegratedAnalysisCriteriaVehicle extends IntegratedAnalysisCriteriaBase {
  constructor(props) {
    super(props);
  };

  getMainTitle() {
    return '查詢條件';
  };

  getSubTitle() {
    return '第二步 挑選車輛屬性資料';
  };

  dataPreparing(props, _this, callback) {
    IntegratedAnalysisAction.getVehicleCriteriaFeatures(callback);
  };

  getPickerProps(props, state) {
    return assign(super.getPickerProps(props, state), {
      features: state.features,
      featureRefCodeMap: state.featureRefCodeMap
    });
  };
};