import React from 'react';
import CriteriaBase from './CriteriaBase';
import CriteriaAction from '../actions/criteria-action';

/**
 * only control display mode between preview and edit. Never keep criteria data in state.
 * this.criteria is used to store current criteria, which response by subtree.
 */
export default class CustomTargetFilterCriteria extends CriteriaBase {
  constructor(props) {
    super(props);
  };

  getMainTitle() {
    return '名單條件設定';
  };

  getFoldingFieldData(options, callback) {
    CriteriaAction.getCriteriaFieldsData(options.mdId, options.batId, callback);
  };
};
