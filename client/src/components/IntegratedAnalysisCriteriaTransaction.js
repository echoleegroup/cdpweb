import React from 'react';
import CriteriaComboBundle from './CriteriaComboBundle';
import IntegratedAnalysisCriteriaBase from "./IntegratedAnalysisCriteriaBase";
import IntegratedAnalysisAction from "../actions/integrated-analysis-action";
import {CRITERIA_COMPONENT_DICT} from "../utils/criteria-dictionary";

export default class IntegratedAnalysisCriteriaTransaction extends IntegratedAnalysisCriteriaBase {

  subheadText() {
    return '第三步 挑選明細資料指定條件';
  };

  dataPreparing(props, _this, callback) {
    // IntegratedAnalysisAction.getVehicleCriteriaFeatures(callback);
    IntegratedAnalysisAction.getTransactionFeatureSets(data => {
      callback({
        transactionSets: data
      });
    });
  };

  // getCriteriaAssignmentProps(props, state) {
  //   return {
  //     transactionSets: state.transactionSets || []
  //   };
  // };

  ComponentCriteriaBundleContainer(props) {
    return <CriteriaTransactionComboBundle {...props}/>
  };
};

class CriteriaTransactionComboBundle extends CriteriaComboBundle {
  getAssignCriteriaBundleType() {
    return CRITERIA_COMPONENT_DICT.TRANSACTION
  };

  assignCriteriaBundle() {
    //TODO: open feature set picker
    //TODO: get criteria feature by setId
    // this.setState({
    //   criteria: this.state.criteria.push(super.getBundleProperties({
    //     type: this.getAssignCriteriaBundleType()
    //   }))
    // });
  };
}