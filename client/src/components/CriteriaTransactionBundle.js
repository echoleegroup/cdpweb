import React from 'react';
import CriteriaBundle from './CriteriaBundle';
import CriteriaAssignment from './CriteriaAssignment';

const OPERATOR_OPTIONS =  {
  and: '全部',
  or: '任一',
  not: '皆不'
};
export default class CriteriaDetailBundle extends CriteriaBundle {
  constructor(props) {
    super(props);
    this.OPERATOR_OPTIONS = OPERATOR_OPTIONS;
  };

  componentWillMount() {
    super.componentWillMount();
  };

  componentWillUnmount() {
    console.log('CriteriaDetailBundle: componentWillUnmount', this.state);
    super.componentWillUnmount()
  };

  ComponentCriteriaBody() {
    return (
      <div className="head">
        以下條件的明細記錄{this.CriteriaOperatorSelector()}符合
        {this.ComponentCriteriaBodyTail()}
      </div>
    );
  };

  ComponentCriteriaBodyTail() {
    return (
      <div className="sub_conditon">
        指定參考：<span>{this.state.ref_label}</span>
      </div>
    );
  };

  ComponentCustomized() {
    let mapTpprops = {
      // mdId: props.params.mdId,
      // batId: props.params.batId,
      features: this.state.features || [],
      featureRefCodeMap: this.state.featureRefCodeMap || {}
    };
    return (
      <CriteriaAssignment {...mapTpprops} ref={(e) => {
        this.criteriaAssignmentModal = e;
      }}/>
    );
  };
};