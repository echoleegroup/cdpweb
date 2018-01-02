const util = require('util');
const CriteriaAction = {};

const GET_FIELDS_URL = '/api/criteria/fields/%s';
const GET_HISTORY_LIST = '/api/criteria/history';
const GET_HISTORY = '/api/criteria/history/%s';

CriteriaAction.getFieldsData = (code, callback) => {
  $.ajax({
    url: util.format(GET_FIELDS_URL, code),
    method: 'get'
  }).done((result) => {
    (result.code === 200)?
      callback(null, result.data):
      callback(result.message);
  }).fail((err) => {
    callback(err);
  });
};

CriteriaAction.getHistory = (code, callback) => {
  $.ajax({
    url: util.format(GET_HISTORY, code),
    method: 'get'
  }).done((result) => {
    (result.code === 200)?
      callback(null, result.data):
      callback(result.message);
  }).fail((err) => {
    callback(err);
  });
};

export default CriteriaAction;