'use strict'

const _ = require('lodash');
const Q = require('q');
const shortid = require('shortid');
const winston = require('winston');
const _connector = require('../utils/sql-query-util');

const PROCESS_STATUS = Object.freeze({
  INIT: "INIT",
  REMOTE_PROCESSING: "REMOTE_PROCESSING",
  REMOTE_SERVICE_UNAVAILABLE: "REMOTE_SERVICE_UNAVAILABLE",
  REMOTE_FILE_NOT_FOUND: "REMOTE_FILE_NOT_FOUND",
  PARSING: "PARSING",
  PARSING_FAILED: "PARSING_FAILED",
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
    winston.error(`===update integration query task failed! (queryId=${queryId}, status=${status}: `, err);
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
    winston.error(`===insert query task failed! (queryID=${queryId}, userId=${userId}: `, err);
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
    .setInput('queryScript', _connector.TYPES.NVarChar, queryScript);

  Q.nfcall(request.executeUpdate, sql).then(rowsAffected => {
    if (rowsAffected === 1) {
      callback(null, queryId);
    } else {
      throw new Error();
    }
  }).fail(err => {
    winston.error(`===update integration query task failed! (queryId=${queryId}, status=${status}): `, err);
    callback(err);
  });
};

module.exports.setQueryTaskStatusRemoteServiceUnavailable = (queryId, callback) => {
  updateTaskStatus(queryId, PROCESS_STATUS.REMOTE_SERVICE_UNAVAILABLE, callback);
};

module.exports.setQueryTaskStatusRemoteFileNotFound = (queryId, callback) => {
  updateTaskStatus(queryId, PROCESS_STATUS.REMOTE_FILE_NOT_FOUND, callback);
};

module.exports.setQueryTaskStatusParsing = (queryId, callback) => {
  updateTaskStatus(queryId, PROCESS_STATUS.PARSING, callback);
};

module.exports.setQueryTaskStatusParsingFailed = (queryId, callback) => {
  updateTaskStatus(queryId, PROCESS_STATUS.PARSING_FAILED, callback);
};

module.exports.setQueryTaskStatusComplete = (queryId, sizeInBytes, entries, records, callback) => {
  const sql = 'UPDATE cu_IntegratedQueryTask ' +
    'SET archiveSizeInBytes = @archiveSizeInBytes, archiveEntries = @archiveEntries,' +
    'status = @status, records = @records, updTime = @updTime ' +
    'WHERE queryID = @queryId ';

  let request = _connector.queryRequest()
    .setInput('queryId', _connector.TYPES.NVarChar, queryId)
    .setInput('updTime', _connector.TYPES.DateTime, new Date())
    .setInput('status', _connector.TYPES.NVarChar, PROCESS_STATUS.COMPLETE)
    .setInput('records', _connector.TYPES.BigInt, records)
    .setInput('archiveSizeInBytes', _connector.TYPES.BigInt, sizeInBytes)
    .setInput('archiveEntries', _connector.TYPES.NVarChar, entries);

  Q.nfcall(request.executeUpdate, sql).then(rowsAffected => {
    if (rowsAffected === 1) {
      callback(null, queryId);
    } else {
      throw new Error();
    }
  }).fail(err => {
    winston.error(`===update integration query task failed! (queryId=${queryId}, status=${status}): `, err);
    callback(err);
  });
};

module.exports.getQueryTask = (queryId, callback) => {
  const sql = 'SELECT task.queryID, task.status, task.records, log.crtTime, log.updUser, ' +
    'task.archiveSizeInBytes, task.archiveEntries, log.criteria ' +
    'FROM cu_IntegratedQueryTask as task LEFT JOIN cu_QueryLog as log ' +
    'on task.queryID = log.queryID WHERE task.queryID = @queryId';

  let request = _connector.queryRequest()
    .setInput('queryId', _connector.TYPES.NVarChar, queryId);

  Q.nfcall(request.executeQuery, sql).then(result => {
    callback(null, result[0]);
  }).fail(err => {
    callback(err);
  });
};
