import React from 'react';
import {assign} from 'lodash';
import {getTagFeatureSets} from "../actions/integrated-analysis-action";
import {CRITERIA_COMPONENT_DICT} from "../utils/criteria-dictionary";
import CriteriaTransactionComboBundle from "./CriteriaComboBundleTransaction";
import IntegratedCriteriaTransaction from "./IntegratedCriteriaTransaction";

export default class IntegratedCriteriaTag extends IntegratedCriteriaTransaction {

  subheadText() {
    return '第四步 挑選標籤篩選資料';
  };

  fetchPreparedData(callback) {
    // console.log('TAG fetchPreparedData');
    getTagFeatureSets(data => {
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
};

class CriteriaTagComboBundle extends CriteriaTransactionComboBundle {

  childBundleType() {
    return CRITERIA_COMPONENT_DICT.TAG;
  };
}