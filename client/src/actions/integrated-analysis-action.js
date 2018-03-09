import {format} from 'util';
import action from './action';
import Rx from "rxjs/Rx";

const CRITERIA_FEATURES_URL_CLIENT = '/api/integration/features/criteria/client';
const CRITERIA_FEATURES_URL_VEHICLE = '/api/integration/features/criteria/vehicle';
const CRITERIA_FEATURES_URL_TRANSACTION = '/api/integration/features/criteria/transaction/set/%s';
const CRITERIA_FEATURE_SETS_URL_TRANSACTION = '/api/integration/features/criteria/transaction/sets';
const EXPORT_FEATURE_POOL = '/api/integration/export/features';
const EXPORT_TRANSACTION_POOL = '/api/integration/export/relative/sets';
const EXPORT_QUERY = '/api/integration/export/query';
const EXPORT_QUERY_TASK = '/api/integration/export/query/%s';

const FilterAction = {
  EXPORT_QUERY: EXPORT_QUERY
};

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

FilterAction.getExportFeaturePool = (success, fail) => {
  let fetchExportFeatureOptions = action.ajaxGetObservable(EXPORT_FEATURE_POOL, undefined, undefined);
  let fetchExportTransactionOptions = action.ajaxGetObservable(EXPORT_TRANSACTION_POOL, undefined, undefined);
  Rx.Observable.forkJoin(fetchExportFeatureOptions, fetchExportTransactionOptions).subscribe(res => {
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
    success && success(data);
  }, err => {
    console.log('===getQueryTask failed: ', err);
    fail && fail(err);
  });
};

export default FilterAction;