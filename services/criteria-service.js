const Q = require('q');
const mssql = require('mssql');
const winston = require('winston');
const _connector = require('../utils/sql-query-util');
const test_data = require('../client/test/preferred-criteria-test');

module.exports.getFilterFields = (moduleCode, callback) => {
  callback(null, test_data.fields[moduleCode]);
};

module.exports.getFieldReference = (refCode, callback) => {
  callback(null, test_data.refs[refCode]);
};

module.exports.getCriteriaHistoryList = (callback) => {};
module.exports.getCriteriaHistory = (id, callback) => {
  callback(null, test_data.criteria[id]);
};