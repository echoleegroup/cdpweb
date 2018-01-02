import React from 'react';
import CriteriaBundle from './CriteriaBundle';

const OPERATOR_OPTIONS =  Object.assign({}, {
  and: '全部',
  or: '任一',
  not: '皆不'
});
export default class CriteriaDetailBundle extends CriteriaBundle {
  constructor(props) {
    super(props, {
      type: 'refDetail',
      ref_label: props.folderDictionary[props.criteria.ref].label,
      OPERATOR_OPTIONS: OPERATOR_OPTIONS
    });
  }

  componentWillUnmount() {
    console.log('CriteriaDetailBundle: componentWillUnmount', this.state);
    super.componentWillUnmount()
  };
/*
  render() {
    return super.render();
  }
*/
  CriteriaHead() {
    return (
      <div className="head">
        以下條件的明細記錄{this.CriteriaOperatorSelector()}符合
        {this.CriteriaHeadTail()}
      </div>
    );
  };

  CriteriaHeadTail() {
    // console.log('CriteriaDetailBundle::CriteriaHeadTail: ', this.props.folderDictionary);
    // console.log('CriteriaDetailBundle::CriteriaHeadTail: ', this.state.ref);
    return (
      <div className="sub_conditon">
        指定參考：<span>{this.state.ref_label}</span>
      </div>
    );
  };
/*
  ChildCriteria(criteria, index) {
    return super.ChildCriteria(criteria, index);
  };

  ControlButton() {
    return super.ControlButton();
  };
  */
};