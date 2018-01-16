import {format} from 'util';
import action from './action';

const CRITERIA_FIELDS_URL = '/api/target/%s/%s/criteria/fields/test';
const CRITERIA_HISTORY_URL = '/api/target/%s/%s/criteria/history/xxx/test';
const FILTER_RESULT_PREVIEW = '/api/target/%s/%s/criteria/preview';
const FILTER_RESULT_EXPORT = '/api/target/%s/%s/criteria/export';
const CriteriaAction = {};

CriteriaAction.getCriteriaFieldsData = (mdId, batId, callback) => {
  let url = format(CRITERIA_FIELDS_URL, mdId, batId);
  action.ajaxGetObservable(url, undefined, undefined).subscribe(data => {
    callback(data);
  }, err => {
    console.log('===getCriteriaFieldsData failed: ', err);
    callback({});
  });
};

CriteriaAction.getCriteriaHistory = (mdId, batId, callback) => {
  let url = format(CRITERIA_HISTORY_URL, mdId, batId);
  action.ajaxGetObservable(url, undefined, undefined).subscribe(data => {
    callback(data);
  }, err => {
    console.log('===getCriteriaHistory failed: ', err);
    callback({});
  });
};

CriteriaAction.getCustomTargetFilterPreview = (mdId, batId, criteria, callback) => {
  let url = format(FILTER_RESULT_PREVIEW, mdId, batId);
  action.ajaxPostObservable(url, criteria, undefined).subscribe(data => {
    callback(data);}, err => {
    console.log('===getCustomTargetFilterPreview failed: ', err);
    callback({});
  });
};

CriteriaAction.getCustomTargetFilterExport = (mdId, batId, criteria, callback) => {
  let url = format(FILTER_RESULT_EXPORT, mdId, batId);
  action.ajaxPostObservable(url, criteria, undefined).subscribe(data => {
    callback(data);}, err => {
    console.log('===getCustomTargetFilterExport failed: ', err);
    callback({});
  });
};

export default CriteriaAction;