import React from 'react';
import CriteriaBase from './CriteriaBase';

const _folding = 'preferred_target';

/**
 * only control display mode between preview and edit. Never keep criteria data in state.
 * this.criteria is used to store current criteria, which response by subtree.
 */
export default class PreferredTargetCriteria extends CriteriaBase {
  constructor(props) {
    super(props, {
      _folding: _folding,
      main_title: '名單條件設定',
      //sub_title: ''
    });
  };
};
