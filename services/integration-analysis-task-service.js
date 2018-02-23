'use strict'

const _ = require('lodash');
const Q = require('q');
const shortid = require('shortid');
const winston = require('winston');
const _connector = require('../utils/sql-query-util');

const PROCESS_STATUS = Object.freeze({
  INIT: "INIT",
  REMOTE_PROCESSING: "REMOTE_PROCESSING",
  PARSING: "PARSING",
  COMPLETE: "COMPLETE"
});

const updateTaskStatus = (queryId, status, callback) => {
  const sql = 'UPDATE cu_IntegratedQueryTask ' +
    'SET status = @status, updTime = @updTime ' +
    'WHERE queryID = @queryId ';

  let request = _connector.queryRequest()
    .setInput('queryId', _connector.TYPES.NVarChar, queryId)
    .setInput('updTime', _connector.TYPES.DateTime, new Date())
    .setInput('status', _connector.TYPES.NVarChar, status);

  Q.nfcall(request.executeUpdate, sql).then(rowsAffected => {
    if (rowsAffected === 1) {
      callback(null, queryId);
    } else {
      throw new Error();
    }
  }).fail(err => {
    winston.error(`===update integration query task failed! (queryId=${queryId}, status=${status}`);
    winston.error(err);
    callback(err);
  });
};

module.exports.PROCESS_STATUS = PROCESS_STATUS;

module.exports.initQueryTask = (queryId, userId, callback) => {
  const sql = 'INSERT INTO cu_IntegratedQueryTask (queryID, status, crtTime, updTime, updUser) ' +
    'VALUES (@queryId, @status, @crtTime, @updTime, @updUser)';

  let now = new Date();
  let request = _connector.queryRequest()
    .setInput('queryId', _connector.TYPES.NVarChar, queryId)
    .setInput('status', _connector.TYPES.NVarChar, PROCESS_STATUS.INIT)
    .setInput('crtTime', _connector.TYPES.DateTime, now)
    .setInput('updTime', _connector.TYPES.DateTime, now)
    .setInput('updUser', _connector.TYPES.NVarChar, userId);

  // Q.nfcall(request.executeQuery, sql).then(result => {
  //   winston.info(`===insertQueryLog result: ${result}`);
  // });
  Q.nfcall(request.executeQuery, sql).then(result => {
    callback(null, {
      queryID: queryId
    });
  }).fail(err => {
    winston.error(`===insert query task failed! (queryID=${queryId}, userId=${userId}`);
    winston.error(err);
    callback(err);
  });
};

module.exports.setQueryTaskStatusProcessing = (queryId, queryScript, callback) => {
  const sql = 'UPDATE cu_IntegratedQueryTask ' +
    'SET status = @status, updTime = @updTime, queryScript = @queryScript ' +
    'WHERE queryID = @queryId ';

  let request = _connector.queryRequest()
    .setInput('queryId', _connector.TYPES.NVarChar, queryId)
    .setInput('updTime', _connector.TYPES.DateTime, new Date())
    .setInput('status', _connector.TYPES.NVarChar, PROCESS_STATUS.REMOTE_PROCESSING)
    .setInput('queryScript', _connector.TYPES.TEXT, queryScript);

  Q.nfcall(request.executeUpdate, sql).then(rowsAffected => {
    if (rowsAffected === 1) {
      callback(null, queryId);
    } else {
      throw new Error();
    }
  }).fail(err => {
    winston.error(`===update integration query task failed! (queryId=${queryId}, status=${status}`);
    winston.error(err);
    callback(err);
  });
};

module.exports.setQueryTaskStatusParsing = (queryId, callback) => {
  updateTaskStatus(queryId, PROCESS_STATUS.PARSING, callback);
};

module.exports.setQueryTaskStatusComplete = (queryId, callback) => {
  updateTaskStatus(queryId, PROCESS_STATUS.COMPLETE, callback);
};

module.exports.insertQueryTask = (queryID, queryScript, status = PROCESS_STATUS.INIT, updUser, callback) => {
  const sql = 'INSERT INTO cu_IntegratedAsyncQueryTask (' +
    'queryID, queryScript, status, crtTime, updTime, updUser) ' +
    'VALUES (@queryId, @queryScript, @status, @crtTime, @updTime, @updUser)';

  let queryId = shortid.generate();
  let now = new Date();
  let request = _connector.queryRequest()
    .setInput('queryId', _connector.TYPES.NVarChar, queryId)
    .setInput('queryScript', _connector.TYPES.Text, queryScript)
    .setInput('status', _connector.TYPES.NVarChar, criteria)
    .setInput('crtTime', _connector.TYPES.DateTime, now)
    .setInput('updTime', _connector.TYPES.DateTime, now)
    .setInput('updUser', _connector.TYPES.DateTime, updUser);

  // Q.nfcall(request.executeQuery, sql).then(result => {
  //   winston.info(`===insertQueryLog result: ${result}`);
  // });
  Q.nfcall(request.executeQuery, sql).then(result => {
    callback(null, {
      queryID: queryId
    });
  }).fail(err => {
    winston.error(`===insert query task failed! (queryID=${queryID}, queryScript=${queryScript}, status=${status}, updUser=${updUser})`);
    winston.error(err);
    callback(err);
  });
};
