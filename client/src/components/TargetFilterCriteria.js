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
      _folding: _folding
    });
  };

  componentDidMount() {
    super.componentDidMount();
  };

  render() {
    return super.render();
  };

  MainTitle() {
    return <h2>名單條件設定</h2>;
  }

  SubTitle() {
    return <div/>;
  }
};
