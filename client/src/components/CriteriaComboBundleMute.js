import React from 'react';
import Loader from 'react-loader';
import {assign} from 'lodash';
import CriteriaTransactionBundle from './CriteriaTransactionBundle';
import CriteriaComboBundle from "./CriteriaComboBundle";
import {CRITERIA_COMPONENT_DICT} from "../utils/criteria-dictionary";

export default class CriteriaComboBundleMute extends CriteriaComboBundle {
  ComponentChildCriteria(criteria, index) {
    // console.log('ComponentChildCriteria: ', criteria);
    switch(criteria.type) {
      case CRITERIA_COMPONENT_DICT.TRANSACTION:
        return <CriteriaTransactionBundleMute key={criteria.uuid} {...this.props}
                                          criteria={criteria}
                                          index={index}
                                          removeCriteria={this.removeCriteria}
                                          collectCriteriaComponents={this.collectCriteriaComponents}
                                          removeCriteriaComponents={this.removeCriteriaComponents}/>;
      default:
        return super.ComponentChildCriteria(criteria, index);
    }
  };
}

class CriteriaTransactionBundleMute extends CriteriaTransactionBundle {

  fetchFeatureData() {
    //DO overwrite, but do nothing
  };

  ComponentCriteriaBody(props) {
    return (
      <div className="head">
        以下條件的明細記錄{this.CriteriaOperatorSelector()}符合
        {this.ComponentCriteriaBodyTail()}
      </div>
    );
  };

  ComponentCriteriaBodyTail(props) {
    return (
      <div className="sub_conditon">
        指定參考：<span>{this.getPropertyState('ref_label')}</span>
      </div>
    );
  };

  ComponentCustomized(props) {
    return <div/>;
  };
};