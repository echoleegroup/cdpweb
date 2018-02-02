import React from 'react';
import Loader from 'react-loader';
import {assign} from 'lodash';
import CriteriaTransactionBundle from './CriteriaTransactionBundle';

export default class CriteriaTransactionBundleMute extends CriteriaTransactionBundle {

  fetchPreparedData() {
    //DO overwrite, but do nothing
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
        指定參考：<span>{this.getPropertyState('ref_label')}</span>
      </div>
    );
  };

  ComponentCustomized() {
    return <div/>;
  };
};