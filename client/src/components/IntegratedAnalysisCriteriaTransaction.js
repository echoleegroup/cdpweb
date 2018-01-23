import React from 'react';
import IntegratedAnalysisCriteriaBase from "./IntegratedAnalysisCriteriaBase";
import IntegratedAnalysisAction from "../actions/integrated-analysis-action";

export default class IntegratedAnalysisCriteriaTransaction extends IntegratedAnalysisCriteriaBase {
  constructor(props) {
    super(props);
  };

  getSubTitle() {
    return '第三步 挑選明細資料指定條件';
  };

  dataPreparing(props, _this, callback) {
    IntegratedAnalysisAction.getTransactionCriteriaFeatures(callback);
  };
};