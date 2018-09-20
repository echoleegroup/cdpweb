import {ajaxGetObservable, ajaxPostObservable} from './action';
import {CATEGORY_DICT} from './integrated-analysis-action';

const ANONYMOUS_FEATURE_SETS_URL_TAG = '/api/integration/anonymous/features/criteria/tag/sets';
const ANONYMOUS_FEATURE_SETS_URL_TRAIL = '/api/integration/anonymous/features/criteria/trail/sets';
const ANONYMOUS_EXPORT_FEATURE_POOL = '/api/integration/anonymous/export/features';
const ANONYMOUS_EXPORT_QUERY = '/api/integration/anonymous/export/query';

exports.getAnonymousTagFeatureSets = (success, fail) => {
  ajaxGetObservable(ANONYMOUS_FEATURE_SETS_URL_TAG, undefined, undefined).subscribe(data => {
    success && success(data);
  }, err => {
    console.log('===getTagFeatureSets failed: ', err);
    fail && fail(err);
  });
};

exports.getAnonymousTrailFeatureSets = (success, fail) => {
  ajaxGetObservable(ANONYMOUS_FEATURE_SETS_URL_TRAIL, undefined, undefined).subscribe(data => {
    let _data = data.map(d => {
      d.category_label = CATEGORY_DICT[d.category] || '';
      return d;
    });
    success && success(_data);
  }, err => {
    console.log('===getTagFeatureSets failed: ', err);
    fail && fail(err);
  });
};

//for anonymous export
exports.getAnonymousExportFeaturePool = (success, fail) => {
  ajaxGetObservable(ANONYMOUS_EXPORT_FEATURE_POOL, undefined, undefined).subscribe(data => {
    success && success(data);
  }, err => {
    console.log('===getExportFeaturePool failed: ', err);
    fail && fail(err);
  });
};

exports.exportAnonymousQuery = (criteria, success, fail) => {
  ajaxPostObservable(ANONYMOUS_EXPORT_QUERY, criteria, undefined).subscribe(data => {
    if (data.status === 'REMOTE_SERVICE_UNAVAILABLE') {
      fail && fail(data.status);
      return;
    }
    success && success(data);
  }, err => {
    console.log('===exportQuery failed: ', err);
    fail && fail(err);
  });
};