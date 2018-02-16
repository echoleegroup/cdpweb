import React from 'react';
import {assign} from 'lodash';
import {List} from 'immutable';
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

class CriteriaTransactionComboBundle extends CriteriaComboBundle {
  constructor(props) {
    super(props);
    this.CHILD_BUNDLE_TYPE = CRITERIA_COMPONENT_DICT.TRANSACTION;
  }

  render() {
    // console.log('CriteriaTransactionComboBundle render');
    return super.render();
  };

  toInsertCriteriaBundle() {
    this.props.toPickFeatureSet(({setId, setLabel}) => {
      // console.log(`get setID=${setId} and label=${setLabel}`);
      let criteriaModel = this.getBundleProperties({
        type: this.CHILD_BUNDLE_TYPE,
        ref: setId,
        ref_label: setLabel
      });
      let childCriteria = List(this.gatheringChildCriteria()).push(criteriaModel);
      this.updatePropertyState('criteria', childCriteria);
    });
  };

  ComponentButtonInsertCriteria(props) {
    if (!this.props.isPreview) {
      return (
        <div className="add_condition">{/*<!-- 加條件 條件組合 -->*/}
          <button type="button" className="btn btn-warning" onClick={this.toInsertCriteriaBundle.bind(this)}>
            <i className="fa fa-plus" aria-hidden="true"/>加條件組合
          </button>
        </div>
      );
    } else {
      return null;
    }
  };
}