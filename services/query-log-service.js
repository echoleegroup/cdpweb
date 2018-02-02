'use strict'

const _ = require('lodash');
const Q = require('q');
const shortid = require('shortid');
const winston = require('winston');
const _connector = require('../utils/sql-query-util');

module.exports.insertQueryLog = ({
                                   menuCode = null, criteria = null,
                                   features = null, filters = null,
                                   requestTime = new Date(), queryTime = new Date()}, callback) => {
  const sql = 'INSERT INTO cu_QueryLog (' +
    'queryID, menuCode, criteria, exportFeats, exportFilters, requestTime, queryTime) ' +
    'VALUES (@queryId, @menuCode, @criteria, @exportFeats, @exportFilters, @requestTime, @queryTime)';

  let queryId = shortid.generate();
  let request = _connector.queryRequest()
    .setInput('queryId', _connector.TYPES.NVarChar, queryId)
    .setInput('menuCode', _connector.TYPES.NVarChar, menuCode)
    .setInput('criteria', _connector.TYPES.NVarChar, criteria)
    .setInput('exportFeats', _connector.TYPES.NVarChar, features)
    .setInput('exportFilters', _connector.TYPES.NVarChar, filters)
    .setInput('requestTime', _connector.TYPES.DateTime, requestTime)
    .setInput('queryTime', _connector.TYPES.DateTime, queryTime);

  // Q.nfcall(request.executeQuery, sql).then(result => {
  //   winston.info(`===insertQueryLog result: ${result}`);
  // });
  Q.nfcall(request.executeQuery, sql).then(result => {
    callback(null, {
      queryID: queryId
    });
  }).fail(err => {
    winston.error(`===insert query log failed! (menuCode=${menuCode}, $criteria=${criteria}, features=${features}, filter=${filters})`);
    winston.error(err);
    callback(err);
  });
};

module.exports.updateQueryLog = ({queryId = null, responseTime = new Date(), resultFilename = null}, callback) => {
  const sql = 'UPDATE cu_QueryLog ' +
    'SET queryResponseTime = @responseTime, queryResultFilename = @resultFilename ' +
    'WHERE queryID = @queryId ; ' +
    'SELECT SCOPE_IDENTITY() AS id';

  let request = _connector.queryRequest()
    .setInput('queryId', _connector.TYPES.NVarChar, queryId)
    .setInput('responseTime', _connector.DataTypes.DateTime, responseTime)
    .setInput('resultFilename', _connector.DataTypes.DateTime, resultFilename);

  Q.nfcall(request.executeUpdate, sql).then(rowsAffected => {
    if (rowsAffected === 1) {
      callback(null, queryId);
    } else {
      throw new Error();
    }
  }).fail(err => {
    winston.error(`===update query log failed! (queryId=${queryId}, responseTime=${responseTime}, resultFilename=${resultFilename})`);
    winston.error(err);
    callback(err);
  });
};

module.exports.insertDownloadLog = ({queryId = null, filename = null, userId = null, downloadDate = new Date()}, callback) => {
  const sql = 'INSERT INTO sy_DnldLog (queryID, logFilename, userId, dnldDatetime) ' +
    'VALUES (@queryId, @filename, @userId, @downloadDate) ; ' +
    'SELECT SCOPE_IDENTITY() AS logID';

  let request = _connector.queryRequest()
    .setInput('queryId', _connector.DataTypes.NVarChar, queryId)
    .setInput('filename', _connector.DataTypes.NVarChar, filename)
    .setInput('userId', _connector.DataTypes.NVarChar, userId)
    .setInput('downloadDate', _connector.DataTypes.NVarChar, downloadDate);

  Q.nfcall(request.executeQuery, sql).then(result => {
    callback(null, result);
  }).fail(err => {
    winston.error(`===insert query log failed! (menuCode=${menuCode}, $criteria=${criteria}, features=${features}, filter=${filters})`);
    winston.error(err);
    callback(err);
  });
};