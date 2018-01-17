import {format} from 'util';
import action from './action';

const CRITERIA_FIELDS_URL = '/api/target/%s/%s/criteria/fields';
const CRITERIA_HISTORY_URL = '/api/target/%s/%s/criteria/history';
const FILTER_RESULT_PREVIEW = '/api/target/%s/%s/criteria/preview';
const FILTER_RESULT_EXPORT = '/api/target/%s/%s/criteria/export';
const CriteriaAction = {
  CRITERIA_FIELDS_URL,
  CRITERIA_HISTORY_URL,
  FILTER_RESULT_PREVIEW,
  FILTER_RESULT_EXPORT
};

CriteriaAction.getCriteriaFieldsData = (mdId, batId, success, fail) => {
  let url = format(CRITERIA_FIELDS_URL, mdId, batId);
  action.ajaxGetObservable(url, undefined, undefined).subscribe(data => {
    success && success(data);
  }, err => {
    console.log('===getCriteriaFieldsData failed: ', err);
    fail && fail(err);
  });
};

CriteriaAction.getCriteriaHistory = (mdId, batId, success, fail) => {
  let url = format(CRITERIA_HISTORY_URL, mdId, batId);
  action.ajaxGetObservable(url, undefined, undefined).subscribe(data => {
    success && success(data);
  }, err => {
    console.log('===getCriteriaHistory failed: ', err);
    fail && fail(err);
  });
};

CriteriaAction.getCustomTargetFilterPreview = (mdId, batId, criteria, success, fail) => {
  let url = format(FILTER_RESULT_PREVIEW, mdId, batId);
  action.ajaxPostObservable(url, criteria, undefined).subscribe(data => {
    console.log('ajaxPostObservable subscribe: ', data);
    success && success(data);
  }, err => {
    console.log('===getCustomTargetFilterPreview failed: ', err);
    fail && fail(err);
  });
};

CriteriaAction.getCustomTargetFilterExport = (mdId, batId, criteria, success, fail) => {
  let url = format(FILTER_RESULT_EXPORT, mdId, batId);
  action.ajaxPostObservable(url, criteria, undefined).subscribe(data => {
    success && success(data);
  }, err => {
    console.log('===getCustomTargetFilterExport failed: ', err);
    fail && fail(err);
  });
};

export default CriteriaAction;