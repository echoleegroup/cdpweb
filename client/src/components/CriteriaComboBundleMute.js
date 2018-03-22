import React from 'react';
import CriteriaTransactionBundle from './CriteriaTransactionBundle';
import CriteriaTagBundle from './CriteriaTagBundle';
import CriteriaComboBundle from "./CriteriaComboBundle";
import {CRITERIA_COMPONENT_DICT} from "../utils/criteria-dictionary";
import CriteriaTrailPeriodBundle from "./CriteriaTrailPeriodBundle";

export default class CriteriaComboBundleMute extends CriteriaComboBundle {
  ComponentChildCriteria(criteria, index) {
    // console.log('ComponentChildCriteria: ', criteria);
    switch(criteria.type) {
      case CRITERIA_COMPONENT_DICT.TRANSACTION:
        return <CriteriaTransactionBundleMute key={criteria.id}
                                              criteria={criteria}
                                              index={index}
                                              isPreview={this.props.isPreview}
                                              removeCriteria={this.removeCriteria}
                                              collectCriteriaComponents={this.collectCriteriaComponents}
                                              removeCriteriaComponents={this.removeCriteriaComponents}/>;
      case CRITERIA_COMPONENT_DICT.TAG:
        return <CriteriaTagBundleMute key={criteria.id}
                                      criteria={criteria}
                                      index={index}
                                      isPreview={this.props.isPreview}
                                      removeCriteria={this.removeCriteria}
                                      collectCriteriaComponents={this.collectCriteriaComponents}
                                      removeCriteriaComponents={this.removeCriteriaComponents}/>;
      case CRITERIA_COMPONENT_DICT.TRAIL_PERIOD:
        return <CriteriaTrailPeriodBundleMute key={criteria.id}
                                              criteria={criteria}
                                              index={index}
                                              isPreview={this.props.isPreview}
                                              removeCriteria={this.removeCriteria}
                                              collectCriteriaComponents={this.collectCriteriaComponents}
                                              removeCriteriaComponents={this.removeCriteriaComponents}/>;
      default:
        return super.ComponentChildCriteria(criteria, index);
    }
  };
}

class CriteriaTransactionBundleMute extends CriteriaTransactionBundle {

  fetchPreparedData() {
    //DO overwrite, but do nothing
  };

  ComponentCustomized(props) {
    return <div/>;
  };
}

class CriteriaTagBundleMute extends CriteriaTagBundle {

  fetchFeatureData() {
    //DO overwrite, but do nothing
  };

  ComponentCustomized(props) {
    return <div/>;
  };
}

class CriteriaTrailPeriodBundleMute extends CriteriaTrailPeriodBundle {
  fetchPreparedData() {
    //DO overwrite, but do nothing
  };

  ComponentCustomized(props) {
    return <div/>;
  };
}