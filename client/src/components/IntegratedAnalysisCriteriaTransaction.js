import React from 'react';
import {assign} from 'lodash';
import CriteriaTransactionComboBundle from './CriteriaTransactionComboBundle';
import IntegratedAnalysisCriteriaBase from "./IntegratedAnalysisCriteriaBase";
import IntegratedAnalysisAction from "../actions/integrated-analysis-action";
import IntegratedAnalysisFeatureSetPicker from "./IntegratedAnalysisFeatureSetPicker";

export default class IntegratedAnalysisCriteriaTransaction extends IntegratedAnalysisCriteriaBase {

  componentWillMount() {
    super.componentWillMount();

    this.openFeatureSetPicker = (callback) => {
      this.featureSetPickerModal.openModal(data => {
        callback(data);
      });
    };
  };

  subheadText() {
    return '第三步 挑選明細資料指定條件';
  };

  fetchPreparedData(props, _this, callback) {
    // IntegratedAnalysisAction.getVehicleCriteriaFeatures(callback);
    IntegratedAnalysisAction.getTransactionFeatureSets(data => {
      callback({
        featureSets: data
      });
    });
  };

  ComponentCriteriaBundleContainer(props) {
    let mapToProps = assign({}, props, {
      toPickFeatureSet: this.openFeatureSetPicker
    });
    // console.log('Transaction ComponentCriteriaBundleContainer: ', _props);
    return <CriteriaTransactionComboBundle {...mapToProps}/>
  };

  ComponentModals(props) {
    let mapToProps = {
      featureSets: props.featureSets
    };
    return (
      <IntegratedAnalysisFeatureSetPicker {...mapToProps} ref={(e) => {
        this.featureSetPickerModal = e;
      }}/>
    );
  };
};