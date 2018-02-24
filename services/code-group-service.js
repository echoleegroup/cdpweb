const _ = require('lodash');
const Q = require('q');
const winston = require('winston');
const _connector = require('../utils/sql-query-util');

module.exports.getFeatureCodeGroups = (codeGroupList = [], callback) => {
  const codeGroupSql = `'${codeGroupList.join(`', '`)}'`;
  const sql = 'SELECT codeGroup, codeValue, codeLabel ' +
    'FROM CodeGroup_View ' +
    `WHERE codeGroup in (${codeGroupSql}) ` +
    'ORDER BY codeSort';

  let request = _connector.queryRequest();

  Q.nfcall(request.executeQuery, sql).then(result => {
    callback(null, result);
  }).fail(err => {
    winston.error('===getFeatures failed:', err);
    callback(err);
  });
};