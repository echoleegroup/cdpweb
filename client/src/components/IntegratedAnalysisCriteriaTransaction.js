import React from 'react';
import CriteriaTransactionBundle from './CriteriaTransactionBundle';
import IntegratedAnalysisCriteriaBase from "./IntegratedAnalysisCriteriaBase";
import IntegratedAnalysisAction from "../actions/integrated-analysis-action";

export default class IntegratedAnalysisCriteriaTransaction extends IntegratedAnalysisCriteriaBase {

  subheadText() {
    return '第三步 挑選明細資料指定條件';
  };

  dataPreparing(props, _this, callback) {
    IntegratedAnalysisAction.getTransactionFeatureSets(data => {
      callback({
        transactionSets: data
      });
    });
  };

  getCriteriaAssignmentProps(props, state) {
    return {
      treeNodes: state.transactionSets
    };
  };

  ComponentCriteriaBundleContainer(props) {
    return <CriteriaTransactionBundle {...props}/>
  };
};