import {format} from 'util';
import action from './action';

const GET_CRITERIA_FIELDS_URL = '/api/target/%s/%s/criteria/fields';
const GET_CRITERIA_HISTORY_URL = '/api/target/%s/%s/criteria/history';
const CriteriaAction = {};

CriteriaAction.getCriteriaFieldsData = (mdId, batId, callback) => {
  let url = format(GET_CRITERIA_FIELDS_URL, mdId, batId);
  action.get(url, {}, callback);
};

CriteriaAction.getCriteriaHistory = (mdId, batId, callback) => {
  let url = format(GET_CRITERIA_HISTORY_URL, mdId, batId);
  action.get(url, {}, callback);
};

export default CriteriaAction;