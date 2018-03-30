import React from 'react';
import CriteriaBundleTransaction from './CriteriaBundleTransaction';
import CriteriaBundleTag from './CriteriaBundleTag';
import CriteriaComboBundle from "./CriteriaComboBundle";
import {CRITERIA_COMPONENT_DICT} from "../utils/criteria-dictionary";
import CriteriaBundleTrailPeriod from "./CriteriaBundleTrailPeriod";

export default class CriteriaComboBundleMute extends CriteriaComboBundle {
  ComponentChildCriteria(criteria, index) {
    switch(criteria.type) {
      case CRITERIA_COMPONENT_DICT.TRANSACTION:
        return <CriteriaBundleTransactionMute key={criteria.id}
                                              criteria={criteria}
                                              index={index}
                                              isPreview={this.props.isPreview}
                                              removeCriteria={this.removeCriteria}
                                              collectCriteriaComponents={this.collectCriteriaComponents}
                                              removeCriteriaComponents={this.removeCriteriaComponents}/>;
      case CRITERIA_COMPONENT_DICT.TAG:
      case CRITERIA_COMPONENT_DICT.TRAIL_HIT:
        return <CriteriaBundleTagMute key={criteria.id}
                                      criteria={criteria}
                                      index={index}
                                      isPreview={this.props.isPreview}
                                      removeCriteria={this.removeCriteria}
                                      collectCriteriaComponents={this.collectCriteriaComponents}
                                      removeCriteriaComponents={this.removeCriteriaComponents}/>;
      case CRITERIA_COMPONENT_DICT.TRAIL_PERIOD:
        return <CriteriaBundleTrailPeriodMute key={criteria.id}
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

class CriteriaBundleTransactionMute extends CriteriaBundleTransaction {

  fetchPreparedData() {
    //DO overwrite, but do nothing
  };

  ComponentCustomized(props) {
    return <div/>;
  };
}

class CriteriaBundleTagMute extends CriteriaBundleTag {

  ComponentCustomized(props) {
    return <div/>;
  };
}

class CriteriaBundleTrailPeriodMute extends CriteriaBundleTrailPeriod {
  fetchPreparedData() {
    //DO overwrite, but do nothing
  };

  ComponentCustomized(props) {
    return <div/>;
  };
}