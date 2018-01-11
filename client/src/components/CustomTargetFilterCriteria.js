import React from 'react';
import Rx from 'rxjs/Rx';
import CriteriaBase from './CriteriaBase';
import CriteriaAction from '../actions/criteria-action';

/**
 * only control display mode between preview and edit. Never keep criteria data in state.
 * this.criteria is used to store current criteria, which response by subtree.
 */
export default class PreferredTargetCriteria extends CriteriaBase {
  constructor(props) {
    super(props);
  };

  getMainTitle() {
    return '名單條件設定';
  };

  getHistory(options, callback) {
    callback(null, []);
  };

  getFoldingFieldData(options, callback) {
    (Rx.Observable.bindNodeCallback(CriteriaAction.getCriteriaFieldsData)(options.mdId, options.batId))
      .subscribe(
        data => callback(null, data),
        err => console.log('===getFoldingFieldData failed: ', err));

    // nfcall(CriteriaAction.getCriteriaFieldsData, options.mdId, options.batId).then((data) => {
    //   callback(null, data);
    // });
  };
};
