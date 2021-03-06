import {format} from 'util';
import {ajaxGetObservable, ajaxPostObservable} from './action';

const CRITERIA_FEATURES_URL = '/api/target/%s/%s/criteria/features';
// const CRITERIA_FEATURES_URL_TEST = '/api/target/%s/%s/criteria/features/test';
// const CRITERIA_HISTORY_URL = '/api/target/%s/%s/criteria/history';
const FILTER_RESULT_PREVIEW = '/api/target/%s/%s/criteria/preview';
const FILTER_RESULT_EXPORT = '/api/target/%s/%s/criteria/export';

exports.FILTER_RESULT_EXPORT = FILTER_RESULT_EXPORT;

exports.getCustomCriteriaFeatures = (mdId, batId, success, fail) => {
  let url = format(CRITERIA_FEATURES_URL, mdId, batId);
  ajaxGetObservable(url, undefined, undefined).subscribe(data => {
    success && success(data);
  }, err => {
    console.log('===getCustomCriteriaFeatures failed: ', err);
    fail && fail(err);
  });
};

// exports.getCriteriaHistory = (mdId, batId, success, fail) => {
//   let url = format(CRITERIA_HISTORY_URL, mdId, batId);
//   ajaxGetObservable(url, undefined, undefined).subscribe(data => {
//     success && success(data);
//   }, err => {
//     console.log('===getCriteriaHistory failed: ', err);
//     fail && fail(err);
//   });
// };

exports.getCustomTargetFilterPreview = (mdId, batId, criteria, success, fail) => {
  let url = format(FILTER_RESULT_PREVIEW, mdId, batId);
  ajaxPostObservable(url, criteria, undefined).subscribe(data => {
    success && success(data);
  }, err => {
    console.log('===getCustomTargetFilterPreview failed: ', err);
    fail && fail(err);
  });
};

// exports.getCustomTargetFilterExport = (mdId, batId, criteria, success, fail) => {
//   let url = format(FILTER_RESULT_EXPORT, mdId, batId);
//   action.ajaxPostObservable(url, criteria, undefined).subscribe(data => {
//     success && success(data);
//   }, err => {
//     console.log('===getCustomTargetFilterExport failed: ', err);
//     fail && fail(err);
//   });
// };