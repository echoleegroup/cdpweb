import React from 'react';
import {assign} from 'lodash';
import IntegratedAnalysisAction from "../actions/integrated-analysis-action";
import {CRITERIA_COMPONENT_DICT} from "../utils/criteria-dictionary";
import CriteriaTransactionComboBundle from "./CriteriaTransactionComboBundle";
import IntegratedAnalysisCriteriaTransaction from "./IntegratedAnalysisCriteriaTransaction";

export default class IntegratedAnalysisCriteriaTag extends IntegratedAnalysisCriteriaTransaction {

  // componentWillMount() {
  //   super.componentWillMount();
  //
  //   this.openFeatureSetPicker = (callback) => {
  //     this.featureSetPickerModal.openModal(data => {
  //       callback(data);
  //     });
  //   };
  // };

  subheadText() {
    return '第四步 挑選標籤篩選資料';
  };

  fetchPreparedData(props, _this, callback) {
    // console.log('TAG fetchPreparedData');
    IntegratedAnalysisAction.getTagFeatureSets(data => {
      callback({
        featureSets: data
      });
    });
  };

  ComponentCriteriaBundleContainer(props) {
    // console.log('TAG ComponentCriteriaBundleContainer');
    let mapToProps = assign({}, props, {
      toPickFeatureSet: this.openFeatureSetPicker
    });
    // console.log('Tag ComponentCriteriaBundleContainer: ', _props);
    return <CriteriaTagComboBundle {...mapToProps}/>
  };

  // ComponentModals(props) {
  //   let mapToProps = {
  //     featureSets: props.featureSets
  //   };
  //   return (
  //     <IntegratedAnalysisFeatureSetPicker {...mapToProps} ref={(e) => {
  //       this.featureSetPickerModal = e;
  //     }}/>
  //   );
  // };
};

class CriteriaTagComboBundle extends CriteriaTransactionComboBundle {
  // constructor(props) {
  //   console.log('CriteriaTagComboBundle constructor');
  //   super(props);
  //   // this.CHILD_BUNDLE_TYPE = CRITERIA_COMPONENT_DICT.TAG;
  // };

  childBundleType() {
    return CRITERIA_COMPONENT_DICT.TAG;
  };

  // toInsertCriteriaBundle() {
  //   this.props.toPickFeatureSet(({setId, setLabel}) => {
  //     // console.log(`get ref=${ref} and refLabel=${refLabel}`);
  //     let criteriaModel = this.getBundleProperties({
  //       type: this.childBundleType(),
  //       ref: setId,
  //       ref_label: setLabel
  //     });
  //     this.setState(prevState => ({
  //       properties: prevState.properties.set('criteria', prevState.properties.get('criteria').push(criteriaModel))
  //     }));
  //   });
  // };
  //
  // ComponentButtonInsertCriteria(props) {
  //   console.log('TAG  ComponentButtonInsertCriteria');
  //   if (!props.isPreview) {
  //     return (
  //       <div className="add_condition">{/*<!-- 加條件 條件組合 -->*/}
  //         <button type="button" className="btn btn-warning" onClick={this.toInsertCriteriaBundle.bind(this)}>
  //           <i className="fa fa-plus" aria-hidden="true"/>加條件組合
  //         </button>
  //       </div>
  //     );
  //   } else {
  //     return null;
  //   }
  // };
}