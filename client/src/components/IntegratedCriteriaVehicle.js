import React from 'react';
import {getVehicleCriteriaFeatures} from "../actions/integrated-analysis-action";
import IntegratedCriteriaBase from "./IntegratedCriteriaBase";

export default class IntegratedCriteriaVehicle extends IntegratedCriteriaBase {
  constructor(props) {
    super(props);
  };

  subheadText() {
    return '第二步 挑選車輛屬性資料';
  };

  fetchPreparedData(callback) {
    getVehicleCriteriaFeatures(data => {
      callback({
        features: data.features,
        featureRefCodeMap: data.featureRefCodeMap
      });
    });
  };
};