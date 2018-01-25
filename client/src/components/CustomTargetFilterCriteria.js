import React from 'react';
import {assign} from 'lodash';
import CriteriaBase from './CriteriaBase';
import CustomFilterAction from '../actions/custom-filter-action';

/**
 * only control display mode between preview and edit. Never keep criteria data in state.
 * this.criteria is used to store current criteria, which response by subtree.
 */
export default class CustomTargetFilterCriteria extends CriteriaBase {
  constructor(props) {
    super(props);
  };

  headlineText() {
    return '名單條件設定';
  };

  dataPreparing(props, _this, callback) {
    CustomFilterAction.getCustomCriteriaFeatures(props.params.mdId, props.params.batId, callback);
  };
};
