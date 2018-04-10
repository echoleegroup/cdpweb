import {format} from 'util';
import {ajaxGetObservable, ajaxPostObservable} from './action';
import Rx from "rxjs/Rx";

const CRITERIA_FEATURES_URL_CLIENT = '/api/integration/features/criteria/client';
const CRITERIA_FEATURES_URL_VEHICLE = '/api/integration/features/criteria/vehicle';
const CRITERIA_FEATURES_URL_TRANSACTION = '/api/integration/features/criteria/transaction/set/%s';
const CRITERIA_FEATURES_URL_TAG = '/api/integration/features/criteria/tag/set/%s';
const CRITERIA_FEATURES_URL_TRAIL_PERIOD = '/api/integration/features/criteria/trail/period/set/%s';
const CRITERIA_FEATURES_URL_TRAIL_Hit = '/api/integration/features/criteria/trail/hit/set/%s';

const CRITERIA_FEATURE_SETS_URL_TRANSACTION = '/api/integration/features/criteria/transaction/sets';
const CRITERIA_FEATURE_SETS_URL_TAG = '/api/integration/features/criteria/tag/sets';
const CRITERIA_FEATURE_SETS_URL_TRAIL = '/api/integration/features/criteria/trail/sets';

const EXPORT_FEATURE_POOL = '/api/integration/export/features';
const EXPORT_RELATIVES_POOL = '/api/integration/export/relative/sets';
const EXPORT_QUERY = '/api/integration/export/query';
const EXPORT_QUERY_TASK = '/api/integration/export/query/%s';

const ANALYSIS_NAVIGATE_FEATURES = '/api/integration/%s/query/%s/navigate/features';

const TASK_STATUS = {
  INIT: "初始化",
  REMOTE_PROCESSING: "搜尋中",
  REMOTE_SERVICE_UNAVAILABLE: "搜尋服務連線失敗",
  REMOTE_FILE_NOT_FOUND: "無法取得搜尋結果",
  PARSING: "資料解析中",
  PARSING_FAILED: "解析失敗",
  COMPLETE: "完成"
};

const CATEGORY_DICT = {
  TrackRecord: '歷程資料',
  List: '名單'
};

exports.CATEGORY_DICT = CATEGORY_DICT;

exports.getClientCriteriaFeatures = (success, fail) => {
  ajaxGetObservable(CRITERIA_FEATURES_URL_CLIENT, undefined, undefined).subscribe(data => {
    success && success(data);
  }, err => {
    console.log('===getClientCriteriaFeatures failed: ', err);
    fail && fail(err);
  });
};

exports.getVehicleCriteriaFeatures = (success, fail) => {
  ajaxGetObservable(CRITERIA_FEATURES_URL_VEHICLE, undefined, undefined).subscribe(data => {
    success && success(data);
  }, err => {
    console.log('===getVehicleCriteriaFeatures failed: ', err);
    fail && fail(err);
  });
};

exports.getTransactionCriteriaFeatures = (setId, success, fail) => {
  let url = format(CRITERIA_FEATURES_URL_TRANSACTION, setId);
  ajaxGetObservable(url, undefined, undefined).subscribe(data => {
    success && success(data);
  }, err => {
    console.log('===getTransactionCriteriaFeatures failed: ', err);
    fail && fail(err);
  });
};

exports.getTransactionFeatureSets = (success, fail) => {
  ajaxGetObservable(CRITERIA_FEATURE_SETS_URL_TRANSACTION, undefined, undefined).subscribe(data => {
    success && success(data);
  }, err => {
    console.log('===getTransactionFeatureSets failed: ', err);
    fail && fail(err);
  });
};

exports.getTagCriteriaFeatures = (setId, keyword, success, fail) => {
  let url = format(CRITERIA_FEATURES_URL_TAG, setId);
  ajaxPostObservable(url, {keyword}, undefined).subscribe(data => {
    success && success(data);
  }, err => {
    console.log('===getTagCriteriaFeatures failed: ', err);
    fail && fail(err);
  });
};

exports.getTagFeatureSets = (success, fail) => {
  ajaxGetObservable(CRITERIA_FEATURE_SETS_URL_TAG, undefined, undefined).subscribe(data => {
    success && success(data);
  }, err => {
    console.log('===getTagFeatureSets failed: ', err);
    fail && fail(err);
  });
};

exports.getTrailFeatureSets = (success, fail) => {
  ajaxGetObservable(CRITERIA_FEATURE_SETS_URL_TRAIL, undefined, undefined).subscribe(data => {
    let _data = data.map(d => {
      d.category_label = CATEGORY_DICT[d.category] || '';
      return d;
    });
    success && success(_data);
  }, err => {
    console.log('===getTrailFeatureSets failed: ', err);
    fail && fail(err);
  });
};

exports.getTrailPeriodCriteriaFeatures = (setId, success, fail) => {
  let url = format(CRITERIA_FEATURES_URL_TRAIL_PERIOD, setId);
  ajaxGetObservable(url, undefined, undefined).subscribe(data => {
    let _data = data.map(node => {
      node.input_type = 'number';
      return node;
    });
    success && success(_data);
  }, err => {
    console.log('===getTrailPeriodCriteriaFeatures failed: ', err);
    fail && fail(err);
  });
};

exports.getTrailHitCriteriaFeatures = (setId, keyword, periodStart, periodEnd, success, fail) => {
  let url = format(CRITERIA_FEATURES_URL_TRAIL_Hit, setId);
  ajaxPostObservable(url, {keyword, periodStart, periodEnd}, undefined).subscribe(data => {
    success && success(data);
  }, err => {
    console.log('===getTrailPeriodCriteriaFeatures failed: ', err);
    fail && fail(err);
  });
};

//for exports
exports.getExportFeaturePool = (success, fail) => {
  let fetchExportFeatureOptions = ajaxGetObservable(EXPORT_FEATURE_POOL, undefined, undefined);
  let fetchExportRelativeOptions = ajaxGetObservable(EXPORT_RELATIVES_POOL, undefined, undefined);
  Rx.Observable.forkJoin(fetchExportFeatureOptions, fetchExportRelativeOptions).subscribe(res => {
    success({
      featureOptions: res[0],
      relativeSetOptions: res[1]
    });
  }, err => {
    console.log('===getExportFeaturePool failed: ', err);
    fail && fail(err);
  });
};

exports.exportQuery = (criteria, success, fail) => {
  ajaxPostObservable(EXPORT_QUERY, criteria, undefined).subscribe(data => {
    success && success(data);
  }, err => {
    console.log('===exportQuery failed: ', err);
    fail && fail(err);
  });
};

exports.getQueryTask = (queryId, success, fail) => {
  let url = format(EXPORT_QUERY_TASK, queryId);
  ajaxGetObservable(url, undefined, undefined).subscribe(data => {
    data.statusLabel = TASK_STATUS[data.status];
    success && success(data);
  }, err => {
    console.log('===getQueryTask failed: ', err);
    fail && fail(err);
  });
};

exports.getNavigateFeatures = (queryId, mode, success, fail) => {
  let url = format(ANALYSIS_NAVIGATE_FEATURES, mode, queryId);
  ajaxGetObservable(url, undefined, undefined).subscribe(data => {
    success && success(data);
  }, err => {
    console.log('===getQueryTask failed: ', err);
    fail && fail(err);
  });
};