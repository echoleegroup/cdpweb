import React from 'react';
import CriteriaComboBundle from "./CriteriaComboBundle";
import {CRITERIA_COMPONENT_DICT} from "../utils/criteria-dictionary";

export default class CriteriaTransactionComboBundle extends CriteriaComboBundle {
  // constructor(props) {
  //   super(props);
  //   // this.CHILD_BUNDLE_TYPE = CRITERIA_COMPONENT_DICT.TRANSACTION;
  // }

  childBundleType() {
    return CRITERIA_COMPONENT_DICT.TRANSACTION;
  };

  toInsertCriteriaBundle() {
    this.props.toPickFeatureSet(({setId, setLabel}) => {
      // console.log(`get setID=${setId} and label=${setLabel}`);
      let criteriaModel = this.getBundleProperties({
        type: this.childBundleType(),
        ref: setId,
        ref_label: setLabel
      });
      this.setState(prevState => ({
        properties: prevState.properties.set('criteria', prevState.properties.get('criteria').push(criteriaModel))
      }));
    });
  };

  ComponentButtonInsertCriteria(props) {
    if (!props.isPreview) {
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
};