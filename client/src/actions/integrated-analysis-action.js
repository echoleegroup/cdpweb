import {format} from 'util';
import action from './action';
import Rx from "rxjs/Rx";

const CRITERIA_FEATURES_URL_CLIENT = '/api/integration/features/criteria/client';
const CRITERIA_FEATURES_URL_VEHICLE = '/api/integration/features/criteria/vehicle';
const CRITERIA_FEATURES_URL_TRANSACTION = '/api/integration/features/criteria/transaction/set/%s';
const CRITERIA_FEATURES_URL_TAG = '/api/integration/features/criteria/tag/set/%s';
const CRITERIA_FEATURE_SETS_URL_TRANSACTION = '/api/integration/features/criteria/transaction/sets';
const CRITERIA_FEATURE_SETS_URL_TAG = '/api/integration/features/criteria/tag/sets';
const EXPORT_FEATURE_POOL = '/api/integration/export/features';
const EXPORT_RELATIVES_POOL = '/api/integration/export/relative/sets';
const EXPORT_QUERY = '/api/integration/export/query';
const EXPORT_QUERY_TASK = '/api/integration/export/query/%s';

const TASK_STATUS = {
  INIT: "初始化",
  REMOTE_PROCESSING: "搜尋中",
  REMOTE_SERVICE_UNAVAILABLE: "搜尋服務連線失敗",
  REMOTE_FILE_NOT_FOUND: "無法取得搜尋結果",
  PARSING: "資料解析中",
  PARSING_FAILED: "解析失敗",
  COMPLETE: "完成"
};

const FilterAction = {};

FilterAction.getClientCriteriaFeatures = (success, fail) => {
  action.ajaxGetObservable(CRITERIA_FEATURES_URL_CLIENT, undefined, undefined).subscribe(data => {
    success && success(data);
  }, err => {
    console.log('===getClientCriteriaFeatures failed: ', err);
    fail && fail(err);
  });
};

FilterAction.getVehicleCriteriaFeatures = (success, fail) => {
  action.ajaxGetObservable(CRITERIA_FEATURES_URL_VEHICLE, undefined, undefined).subscribe(data => {
    success && success(data);
  }, err => {
    console.log('===getVehicleCriteriaFeatures failed: ', err);
    fail && fail(err);
  });
};

FilterAction.getTransactionCriteriaFeatures = (setId, success, fail) => {
  let url = format(CRITERIA_FEATURES_URL_TRANSACTION, setId);
  action.ajaxGetObservable(url, undefined, undefined).subscribe(data => {
    success && success(data);
  }, err => {
    console.log('===getTransactionCriteriaFeatures failed: ', err);
    fail && fail(err);
  });
};

FilterAction.getTransactionFeatureSets = (success, fail) => {
  action.ajaxGetObservable(CRITERIA_FEATURE_SETS_URL_TRANSACTION, undefined, undefined).subscribe(data => {
    success && success(data);
  }, err => {
    console.log('===getTransactionFeatureSets failed: ', err);
    fail && fail(err);
  });
};

FilterAction.getTagCriteriaFeatures = (setId, keyword, success, fail) => {
  let url = format(CRITERIA_FEATURES_URL_TAG, setId);
  action.ajaxPostObservable(url, {keyword}, undefined).subscribe(data => {
    success && success(data);
  }, err => {
    console.log('===getTransactionCriteriaFeatures failed: ', err);
    fail && fail(err);
  });
};

FilterAction.getTagFeatureSets = (success, fail) => {
  action.ajaxGetObservable(CRITERIA_FEATURE_SETS_URL_TAG, undefined, undefined).subscribe(data => {
    success && success(data);
  }, err => {
    console.log('===getTagFeatureSets failed: ', err);
    fail && fail(err);
  });
};

//for exports
FilterAction.getExportFeaturePool = (success, fail) => {
  let fetchExportFeatureOptions = action.ajaxGetObservable(EXPORT_FEATURE_POOL, undefined, undefined);
  let fetchExportRelativeOptions = action.ajaxGetObservable(EXPORT_RELATIVES_POOL, undefined, undefined);
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

FilterAction.exportQuery = (criteria, success, fail) => {
  action.ajaxPostObservable(EXPORT_QUERY, criteria, undefined).subscribe(data => {
    success && success(data);
  }, err => {
    console.log('===exportQuery failed: ', err);
    fail && fail(err);
  });
};

FilterAction.getQueryTask = (queryId, success, fail) => {
  let url = format(EXPORT_QUERY_TASK, queryId);
  action.ajaxGetObservable(url, undefined, undefined).subscribe(data => {
    data.statusLabel = TASK_STATUS[data.status];
    success && success(data);
  }, err => {
    console.log('===getQueryTask failed: ', err);
    fail && fail(err);
  });
};

export default FilterAction;