import React from 'react';
import {assign} from 'lodash';
import CriteriaComboBundle from './CriteriaComboBundle';
import IntegratedAnalysisCriteriaBase from "./IntegratedAnalysisCriteriaBase";
import IntegratedAnalysisAction from "../actions/integrated-analysis-action";
import {CRITERIA_COMPONENT_DICT} from "../utils/criteria-dictionary";
import IntegratedAnalysisFeatureSetPicker from "./CriteriaTransactionSetPicker";

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

  ComponentCriteriaBundleContainer() {
    return (props) => {
      let _props = assign({}, props, {
        toPickFeatureSet: this.openFeatureSetPicker
      });
      return <CriteriaTransactionComboBundle {..._props}/>
    };
  };

  ComponentModals() {
    let mapToProps = {
      featureSets: this.state.featureSets
    };
    return (
      <IntegratedAnalysisFeatureSetPicker {...mapToProps} ref={(e) => {
        this.featureSetPickerModal = e;
      }}/>
    );
  };
};

class CriteriaTransactionComboBundle extends CriteriaComboBundle {

  getInsertCriteriaBundleType() {
    console.log('getInsertCriteriaBundleType: ', CRITERIA_COMPONENT_DICT.TRANSACTION);
    return CRITERIA_COMPONENT_DICT.TRANSACTION
  };

  toInsertCriteriaBundle() {
    this.props.toPickFeatureSet(({setId, setLabel}) => {
      console.log(`get setID=${setId} and label=${setLabel}`);
      let criteriaType = this.getInsertCriteriaBundleType();
      console.log(`toPickCriteriaBundle: ${criteriaType}`);
      let criteriaModel = this.getBundleProperties({
        type: this.getInsertCriteriaBundleType(),
        ref: setId,
        ref_label: setLabel
      });
      this.updatePropertyState('criteria', this.getPropertyState('criteria').push(criteriaModel));
    });
  };

  ComponentButtonInsertCriteria() {
    if (!this.props.isPreview) {
      return (
        <div className="add_condition">{/*<!-- 加條件 條件組合 -->*/}
          <button type="button" className="btn btn-warning" onClick={this.toInsertCriteriaBundle.bind(this)}>
            <i className="fa fa-plus" aria-hidden="true"/>加條件組合
          </button>
        </div>
      );
    }
  };
}