import React from 'react';
import CriteriaBase from './CriteriaBase';
import CustomFilterAction from '../actions/custom-filter-action';

/**
 * only control display mode between preview and edit. Never keep criteria data in state.
 * this.criteria is used to store current criteria, which response by subtree.
 */
export default class CustomTargetCriteria extends CriteriaBase {
  constructor(props) {
    super(props);
  };

  headlineText() {
    return '名單條件設定';
  };

  fetchPreparedData(callback) {
    CustomFilterAction.getCustomCriteriaFeatures(this.props.params.mdId, this.props.params.batId, callback);
  };
};
