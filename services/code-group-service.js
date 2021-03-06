const _ = require('lodash');
const Q = require('q');
const winston = require('winston');
const _connector = require('../utils/sql-query-util');

module.exports.getFeatureCodeGroup = (codeGroup, callback) => {
  this.getFeatureCodeGroups([codeGroup], callback);
};

module.exports.getFeatureCodeGroups = (codeGroupList = [], callback) => {
  const codeGroupSql = `'${codeGroupList.join(`', '`)}'`;
  const sql = 'SELECT codeGroup, codeValue, codeLabel, codeSort ' +
    'FROM CodeGroup_View ' +
    `WHERE codeGroup in (${codeGroupSql}) ` +
    'ORDER BY codeSort';

  let request = _connector.queryRequest();

  Q.nfcall(request.executeQuery, sql).then(result => {
    callback(null, result);
  }).fail(err => {
    winston.error('===getFeatureCodeGroups failed:', err);
    callback(err);
  });
};

module.exports.getPortalSyCodeGroup = (codeGroup, callback) => {
  this.getFeatureCodeGroups([codeGroup], callback);
};

module.exports.getPortalSyCodeGroups = (codeGroupList = [], callback) => {
  const codeGroupSql = `'${codeGroupList.join(`', '`)}'`;
  const sql = 'SELECT codeGroup, codeValue, codeLabel ' +
    'FROM sy_CodeTable ' +
    `WHERE codeGroup in (${codeGroupSql}) ` +
    'ORDER BY codeValue';

  let request = _connector.queryRequest();

  Q.nfcall(request.executeQuery, sql).then(result => {
    callback(null, result);
  }).fail(err => {
    winston.error('===getPortalSyCodeGroups failed:', err);
    callback(err);
  });
};