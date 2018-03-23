import action from './action';
import integratedAction from './integrated-analysis-action';

const ANONYMOUS_FEATURE_SETS_URL_TAG = '/api/integration/anonymous/features/criteria/tag/sets';
const ANONYMOUS_FEATURE_SETS_URL_TRAIL = '/api/integration/anonymous/features/criteria/trail/sets';
const ANONYMOUS_EXPORT_FEATURE_POOL = '/api/integration/anonymous/export/features';
const ANONYMOUS_EXPORT_QUERY = '/api/integration/anonymous/export/query';

module.exports.getAnonymousTagFeatureSets = (success, fail) => {
  action.ajaxGetObservable(ANONYMOUS_FEATURE_SETS_URL_TAG, undefined, undefined).subscribe(data => {
    success && success(data);
  }, err => {
    console.log('===getTagFeatureSets failed: ', err);
    fail && fail(err);
  });
};

module.exports.getAnonymousTrailFeatureSets = (success, fail) => {
  action.ajaxGetObservable(ANONYMOUS_FEATURE_SETS_URL_TRAIL, undefined, undefined).subscribe(data => {
    let _data = data.map(d => {
      d.category_label = integratedAction.CATEGORY_DICT[d.category] || '';
      return d;
    });
    success && success(_data);
  }, err => {
    console.log('===getTagFeatureSets failed: ', err);
    fail && fail(err);
  });
};

//for anonymous export
module.exports.getAnonymousExportFeaturePool = (success, fail) => {
  action.ajaxGetObservable(ANONYMOUS_EXPORT_FEATURE_POOL, undefined, undefined).subscribe(data => {
    success && success(data);
  }, err => {
    console.log('===getExportFeaturePool failed: ', err);
    fail && fail(err);
  });
};

module.exports.exportAnonymousQuery = (criteria, success, fail) => {
  action.ajaxPostObservable(ANONYMOUS_EXPORT_QUERY, criteria, undefined).subscribe(data => {
    success && success(data);
  }, err => {
    console.log('===exportQuery failed: ', err);
    fail && fail(err);
  });
};