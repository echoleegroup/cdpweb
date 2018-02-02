import React from 'react';
import IntegratedAnalysisCriteriaBase from "./IntegratedAnalysisCriteriaBase";
import IntegratedAnalysisAction from "../actions/integrated-analysis-action";
import CriteriaComboBundle from "./CriteriaComboBundle";
import {CRITERIA_COMPONENT_DICT} from "../utils/criteria-dictionary";

export default class IntegratedAnalysisCriteriaTag extends IntegratedAnalysisCriteriaBase {
  subheadText() {
    return '第四步 挑選資料標籤指定條件';
  };

  componentWillMount() {
    super.componentWillMount();

    this.openTagPoolSourcePicker = (callback) => {
      this.tagPoolSourcePickerModal.openModal(data => {
        callback(data);
      });
    };
  };

  fetchPreparedData(props, _this, callback) {
    // TODO: get tag source list
    IntegratedAnalysisAction.getTagPoolSources(data => {
      callback({
        tagSources: data
      });
    });
  };

  ComponentCriteriaBundleContainer() {
    return (props) => {
      let _props = assign({}, props, {
        toPickTagPoolSource: this.openTagPoolSourcePicker
      });
      return <CriteriaTagComboBundle {..._props}/>
    };
  };

  ComponentModals() {
    let mapToProps = {
      tagSources: this.state.tagSources
    };
    return (
      <IntegratedAnalysisTagPicker {...mapToProps} ref={(e) => {
        this.tagPoolSourcePickerModal = e;
      }}/>
    );
  };
};

class CriteriaTagComboBundle extends CriteriaComboBundle {

  getInsertCriteriaBundleType() {
    console.log('getInsertCriteriaBundleType: ', CRITERIA_COMPONENT_DICT.TAG);
    return CRITERIA_COMPONENT_DICT.TAG
  };

  toInsertCriteriaBundle() {
    this.props.toPickTagPoolSource(({ref, refLabel}) => {
      console.log(`get ref=${ref} and refLabel=${refLabel}`);
      let criteriaType = this.getInsertCriteriaBundleType();
      console.log(`toPickCriteriaBundle: ${criteriaType}`);
      let criteriaModel = this.getBundleProperties({
        type: this.getInsertCriteriaBundleType(),
        ref: ref,
        ref_label: refLabel
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