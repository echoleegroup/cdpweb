import React from 'react';
import Loader from 'react-loader';
import {assign} from 'lodash';
import CriteriaTransactionBundle from './CriteriaTransactionBundle';
import CriteriaComboBundle from "./CriteriaComboBundle";
import {CRITERIA_COMPONENT_DICT} from "../utils/criteria-dictionary";

export default class CriteriaComboBundleMute extends CriteriaComboBundle {
  ComponentChildCriteria(props) {
    // console.log('ComponentChildCriteria: ', criteria);
    let criteria = props.criteria;
    switch(criteria.type) {
      case CRITERIA_COMPONENT_DICT.TRANSACTION:
        return <CriteriaTransactionBundleMute criteria={criteria}
                                              index={props.index}
                                              removeCriteria={this.removeCriteria}
                                              collectCriteriaComponents={this.collectCriteriaComponents}
                                              removeCriteriaComponents={this.removeCriteriaComponents}/>;
      default:
        let SuperComponentChildCriteria = super.ComponentChildCriteria.bind(this);
        return <SuperComponentChildCriteria {...props}/>
    }
  };
}

class CriteriaTransactionBundleMute extends CriteriaTransactionBundle {

  fetchFeatureData() {
    //DO overwrite, but do nothing
  };

  ComponentCustomized(props) {
    return <div/>;
  };
};