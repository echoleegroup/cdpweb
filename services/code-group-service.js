const _ = require('lodash');
const Q = require('q');
const winston = require('winston');
const _connector = require('../utils/sql-query-util');

module.exports.getFeatureCodeGroup = (codeGroup, callback) => {
  this.getFeatureCodeGroups([codeGroup], callback);
};

module.exports.getFeatureCodeGroups = (codeGroupList = [], callback) => {
  const request = _connector.queryRequest();
  const codeGroupSql = codeGroupList.map((code, index) => {
    const parameterized = `codeGroup_${index}`;
    request.setInput(parameterized, _connector.TYPES.NVarChar, code);
    return `@${parameterized}`;
  }).join(', ');
  const sql = 'SELECT codeGroup, codeValue, codeLabel, codeSort ' +
    'FROM CodeGroup_View ' +
    `WHERE codeGroup in (${codeGroupSql}) ` +
    'ORDER BY codeSort';

  Q.nfcall(request.executeQuery, sql).then(result => {
    callback(null, result);
  }).fail(err => {
    winston.error('===getFeatureCodeGroups failed:', err);
    callback(err);
  });
};