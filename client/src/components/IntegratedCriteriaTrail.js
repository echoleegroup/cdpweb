import React from 'react';
import {assign} from 'lodash';
import IntegratedCriteriaTransaction from "./IntegratedCriteriaTransaction";
import integratedAnalysisAction from "../actions/integrated-analysis-action";
import CriteriaTransactionComboBundle from "./CriteriaComboBundleTransaction";
import {CRITERIA_COMPONENT_DICT} from "../utils/criteria-dictionary";

export default class IntegratedCriteriaTrail extends IntegratedCriteriaTransaction {
  subheadText() {
    return '第五步 挑選顧客行為軌跡指定條件';
  };

  fetchPreparedData(callback) {
    integratedAnalysisAction.getTrailFeatureSets(data => {
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
    return <CriteriaTrailComboBundle {...mapToProps}/>
  };
};

class CriteriaTrailComboBundle extends CriteriaTransactionComboBundle {
  childBundleType(category) {
    switch (category) {
      case 'TrackRecord':
        return CRITERIA_COMPONENT_DICT.TRAIL_PERIOD;
      case 'List':
        return CRITERIA_COMPONENT_DICT.TRAIL_HIT;
      default:
        throw new Error(`unknown trail type: ${category}`);
    }
  };
}