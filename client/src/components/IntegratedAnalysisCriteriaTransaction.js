import React from 'react';
import {assign} from 'lodash';
import CriteriaAction from "../actions/criteria-action";
import IntegratedAnalysisCriteriaBase from "./IntegratedAnalysisCriteriaBase";

export default class IntegratedAnalysisCriteriaTransaction extends IntegratedAnalysisCriteriaBase {
  constructor(props) {
    super(props);
  };

  getMainTitle() {
    return '查詢條件';
  };

  getSubTitle() {
    return '第三步 挑選明細資料指定條件';
  };

  dataPreparing(props, _this, callback) {
    CriteriaAction.getCustomCriteriaFeatures(props.params.mdId, props.params.batId, callback);
  };

  getPickerProps(props, state) {
    return assign(super.getPickerProps(props, state), {
      features: state.features,
      featureRefCodeMap: state.featureRefCodeMap
    });
  };
};