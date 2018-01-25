import {format} from 'util';
import action from './action';

const CRITERIA_FEATURES_URL_CLIENT = '/api/integration/client/criteria/features';
const CRITERIA_FEATURES_URL_VEHICLE = '/api/integration/vehicle/criteria/features';
const CRITERIA_FEATURES_URL_TRANSACTION = '/api/integration/transaction/criteria/features';
const CRITERIA_FEATURE_SETS_URL_TRANSACTION = '/api/integration/transaction/feature/sets';

const FilterAction = {};

FilterAction.getClientCriteriaFeatures = (success, fail) => {
  action.ajaxGetObservable(CRITERIA_FEATURES_URL_CLIENT, undefined, undefined).subscribe(({features, featureRefCodeMap}) => {
    success && success({
      treeNodes: features,
      nodeRefCodeMap: featureRefCodeMap
    });
  }, err => {
    console.log('===getClientCriteriaFeatures failed: ', err);
    fail && fail(err);
  });
};

FilterAction.getVehicleCriteriaFeatures = (success, fail) => {
  action.ajaxGetObservable(CRITERIA_FEATURES_URL_VEHICLE, undefined, undefined).subscribe(({features, featureRefCodeMap}) => {
    success && success({
      treeNodes: features,
      nodeRefCodeMap: featureRefCodeMap
    });
  }, err => {
    console.log('===getVehicleCriteriaFeatures failed: ', err);
    fail && fail(err);
  });
};

FilterAction.getTransactionCriteriaFeatures = (success, fail) => {
  action.ajaxGetObservable(CRITERIA_FEATURES_URL_TRANSACTION, undefined, undefined).subscribe(({features, featureRefCodeMap}) => {
    success && success({
      treeNodes: features,
      nodeRefCodeMap: featureRefCodeMap
    });
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

export default FilterAction;