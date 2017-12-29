import React from 'react';
import CriteriaBundle from './CriteriaBundle';
//import {OPERATOR_DICT} from "../utils/criteria-dictionary";

export default class CriteriaDetailBundle extends CriteriaBundle {
  constructor(props) {
    super(props, {
      type: 'refDetail',
      OPERATOR_OPTIONS: ['and', 'or', 'not']
    });
  }

  componentWillUnmount() {
    console.log('CriteriaDetailBundle: componentWillUnmount', this.props.criteria.uuid);
  };

  render() {
    return super.render();
  }

  CriteriaHead() {
    return (
      <div className="head">
        以下條件的明細記錄{this.CriteriaOperatorSelector()}符合
        {this.CriteriaHeadTail()}
      </div>
    );
  };

  CriteriaHeadTail() {
    return (
      <div className="sub_conditon">
        指定參考：<span>{this.props.refFolds[this.state.ref].label}</span>
      </div>
    );
  };

  ChildCriteria(criteria) {
    return super.ChildCriteria(criteria);
  };

  ControlButton() {
    return super.ControlButton();
  };
};