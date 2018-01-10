import React from 'react';
import {format} from 'util';
import CriteriaBase from './CriteriaBase';
import {nfcall} from 'q';
import CriteriaAction from '../actions/criteria-action';

const GET_CRITERIA_FIELDS_URL = '/api/criteria/%s/%s/target/fields';

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
    //nfcall(CriteriaAction.getHistory, _folding);
    //return Q([]);
    //callback(null, _test.criteria[_folding]);
    //callback(null, []);
  };

  getFoldingFieldData(options, callback) {
    let url = format(GET_CRITERIA_FIELDS_URL, options.mdId, options.batId);
    nfcall(CriteriaAction.getCriteriaFieldsData, url).then((data) => {
      callback(null, data);
    });
  };
};
