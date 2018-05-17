'use strict'

const _ = require('lodash');
const Q = require('q');
const shortid = require('shortid');
const winston = require('winston');
const _connector = require('../utils/sql-query-util');

module.exports.insertQueryLog = ({
                                   menuCode = null, criteria = null,
                                   features = null, filters = null,
                                   reserve1 = null, reserve2 = null,
                                   reserve3 = null, updUser
                                 }, callback) => {
  const sql = 'INSERT INTO cu_QueryLog (' +
    'queryID, menuCode, criteria, exportFeats, exportFilters, reserve1, ' +
    'reserve2, reserve3, crtTime, updTime, updUser) ' +
    'VALUES (@queryId, @menuCode, @criteria, @exportFeats, @exportFilters, ' +
    '@reserve1, @reserve2, @reserve3, @crtTime, @updTime, @updUser)';

  let queryId = shortid.generate();
  let now = new Date();
  let request = _connector.queryRequest()
    .setInput('queryId', _connector.TYPES.NVarChar, queryId)
    .setInput('menuCode', _connector.TYPES.NVarChar, menuCode)
    .setInput('criteria', _connector.TYPES.NVarChar, criteria)
    .setInput('exportFeats', _connector.TYPES.NVarChar, features)
    .setInput('exportFilters', _connector.TYPES.NVarChar, filters)
    .setInput('reserve1', _connector.TYPES.NVarChar, reserve1)
    .setInput('reserve2', _connector.TYPES.NVarChar, reserve2)
    .setInput('reserve3', _connector.TYPES.NVarChar, reserve3)
    .setInput('crtTime', _connector.TYPES.DateTime, now)
    .setInput('updTime', _connector.TYPES.DateTime, now)
    .setInput('updUser', _connector.TYPES.NVarChar, updUser);

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

module.exports.updateQueryLogResultFileName = ({queryId = null, responseTime = new Date(), resultFilename = null}, callback) => {
  const sql = 'UPDATE cu_QueryLog ' +
    'SET queryResponseTime = @responseTime, queryResultFilename = @resultFilename ' +
    'WHERE queryID = @queryId ; ' +
    'SELECT SCOPE_IDENTITY() AS id';

  let request = _connector.queryRequest()
    .setInput('queryId', _connector.TYPES.NVarChar, queryId)
    .setInput('responseTime', _connector.TYPES.DateTime, responseTime)
    .setInput('resultFilename', _connector.TYPES.DateTime, resultFilename);

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

module.exports.updateQueryLogProcessingData = (queryId, script, callback) => {
  const sql = 'UPDATE cu_QueryLog SET reserve1 = @script WHERE queryID = @queryId';

  // winston.info('updateQueryLogProcessingData queryId: ', queryId);
  // winston.info('updateQueryLogProcessingData script: ', script);

  let request = _connector.queryRequest()
    .setInput('queryId', _connector.TYPES.NVarChar, queryId)
    .setInput('script', _connector.TYPES.NVarChar, script);

  request.executeUpdate(sql, callback);

  // Q.nfcall(request.executeUpdate, sql).then(result => {
  //   callback(null, result);
  // }).fail(err => {
  //   callback(err);
  // });
};

module.exports.getQueryLogProcessingData = (queryId, callback) => {
  const sql = 'SELECT reserve1, reserve2, updUser, crtTime ' +
    'FROM cu_QueryLog q ' +
    'WHERE queryID = @queryId';

  let request = _connector.queryRequest()
    .setInput('queryId', _connector.TYPES.NVarChar, queryId);

  Q.nfcall(request.executeQuery, sql).then(result => {
    callback(null, result[0]);
  }).fail(err => {
    callback(err);
  });
};

module.exports.insertDownloadLog = ({queryId = null, filePath = null, userId = null, downloadDate = new Date()}, callback) => {
  const sql = 'INSERT INTO sy_DnldLog (queryID, filePath, userId, dnldDatetime) ' +
    'VALUES (@queryId, @filePath, @userId, @downloadDate) ; ' +
    'SELECT SCOPE_IDENTITY() AS logID';

  let request = _connector.queryRequest()
    .setInput('queryId', _connector.TYPES.NVarChar, queryId)
    .setInput('filePath', _connector.TYPES.NVarChar, filePath)
    .setInput('userId', _connector.TYPES.NVarChar, userId)
    .setInput('downloadDate', _connector.TYPES.DateTime, downloadDate);

  Q.nfcall(request.executeQuery, sql).then(result => {
    callback(null, result);
  }).fail(err => {
    winston.error(`===insert query log failed! (queryId=${queryId}, filename=${filename}, userId=${userId}, downloadDate=${downloadDate})`);
    winston.error(err);
    callback(err);
  });
};