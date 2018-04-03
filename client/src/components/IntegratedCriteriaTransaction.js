import React from 'react';
import {assign} from 'lodash';
import CriteriaTransactionComboBundle from './CriteriaComboBundleTransaction';
import IntegratedCriteriaBase from "./IntegratedCriteriaBase";
import {getTransactionFeatureSets} from "../actions/integrated-analysis-action";
import IntegratedCriteriaFeatureSetPicker from "./IntegratedCriteriaFeatureSetPicker";

export default class IntegratedCriteriaTransaction extends IntegratedCriteriaBase {

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

  fetchPreparedData(callback) {
    // integratedAnalysisAction.getVehicleCriteriaFeatures(callback);
    getTransactionFeatureSets(data => {
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
      featureSets: this.state.featureSets
    };
    return (
      <IntegratedCriteriaFeatureSetPicker {...mapToProps} ref={(e) => {
        this.featureSetPickerModal = e;
      }}/>
    );
  };
};