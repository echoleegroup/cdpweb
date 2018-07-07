const _ = require('lodash');
const Q = require('q');
const winston = require('winston');
const _connector = require('../utils/sql-query-util');

module.exports.getFeature = (featureId, callback) => {
  const sql = 'SELECT featID, featName, featNameAbbr ' +
    'FROM cd_Feature ' +
    'WHERE featID = @featId AND (isDel != @isDel OR isDel is NULL)';

  let request = _connector.queryRequest()
    .setInput('featId', _connector.TYPES.NVarChar, featureId)
    .setInput('isDel', _connector.TYPES.NVarChar, 'Y');

  Q.nfcall(request.executeQuery, sql).then(result => {
    callback(null, result[0]);
  }).fail(err => {
    winston.error('===getFeature failed: ', err);
    callback(err);
  });
};

module.exports.getFeatures = (featureIds = [], callback) => {
  const request = _connector
    .queryRequest()
    .setInput('isDel', _connector.TYPES.NVarChar, 'Y');

  const parameterizedSql = featureIds.map((featId, index) => {
    const parameterized = `featId_${index}`;
    request.setInput(parameterized, _connector.TYPES.NVarChar, code);
    return `@${parameterized}`;
  }).join(', ');

  const sql = `SELECT featID, featName, featNameAbbr, codeGroup ` +
    `FROM cd_Feature ` +
    `WHERE featID in (${parameterizedSql}) AND (isDel != @isDel OR isDel is NULL)`;

  Q.nfcall(request.executeQuery, sql).then(result => {
    callback(null, result);
  }).fail(err => {
    winston.error('===getFeatures failed: ', err);
    callback(err);
  });
};