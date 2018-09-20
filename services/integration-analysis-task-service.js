'use strict'

const _ = require('lodash');
const Q = require('q');
const moment = require('moment');
const request = require('request');
const winston = require('winston');
const appConfig = require("../app-config");
const _connector = require('../utils/sql-query-util');

const expire = 2;
const expireUnit = 'month';

const PROCESS_STATUS = Object.freeze({
  INIT: "INIT",
  PENDING: "PENDING",
  REMOTE_PROCESSING: "REMOTE_PROCESSING",
  REMOTE_SERVICE_UNAVAILABLE: "REMOTE_SERVICE_UNAVAILABLE",
  REMOTE_FILE_NOT_FOUND: "REMOTE_FILE_NOT_FOUND",
  RESULT_PACK_NOT_FOUND: "RESULT_PACK_NOT_FOUND",
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
      callback(null, status);
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
  const sql = 'INSERT INTO cu_IntegratedQueryTask (queryID, status, crtTime, updTime, updUser, expTime) ' +
    'VALUES (@queryId, @status, @crtTime, @updTime, @updUser, @expTime)';

  let now = new Date();
  let request = _connector.queryRequest()
    .setInput('queryId', _connector.TYPES.NVarChar, queryId)
    .setInput('status', _connector.TYPES.NVarChar, PROCESS_STATUS.INIT)
    .setInput('crtTime', _connector.TYPES.DateTime, now)
    .setInput('updTime', _connector.TYPES.DateTime, now)
    .setInput('updUser', _connector.TYPES.NVarChar, userId)
    .setInput('expTime', _connector.TYPES.Date, moment().startOf('day').add(expire, expireUnit).toDate());

  // Q.nfcall(request.executeQuery, sql).then(result => {
  //   winston.info(`===insertQueryLog result: ${result}`);
  // });
  Q.nfcall(request.executeQuery, sql).then(result => {
    callback(null, PROCESS_STATUS.INIT);
  }).fail(err => {
    winston.error(`===insert query task failed! (queryID=${queryId}, userId=${userId}: `, err);
    callback(err);
  });
};

module.exports.setQueryTaskStatusPending = (queryId, queryScript, callback) => {
  const sql = 'UPDATE cu_IntegratedQueryTask ' +
    'SET status = @status, updTime = @updTime, queryScript = @queryScript ' +
    'WHERE queryID = @queryId ';

  let request = _connector.queryRequest()
    .setInput('queryId', _connector.TYPES.NVarChar, queryId)
    .setInput('updTime', _connector.TYPES.DateTime, new Date())
    .setInput('status', _connector.TYPES.NVarChar, PROCESS_STATUS.PENDING)
    .setInput('queryScript', _connector.TYPES.NVarChar, queryScript);

  Q.nfcall(request.executeUpdate, sql).then(rowsAffected => {
    if (rowsAffected === 1) {
      callback(null, PROCESS_STATUS.PENDING);
    } else {
      throw new Error();
    }
  }).fail(err => {
    winston.error(`===update integration query task failed! (queryId=${queryId}, status=${status}): `, err);
    callback(err);
  });
};

module.exports.setQueryTaskStatusProcessing = (queryId, callback) => {
  updateTaskStatus(queryId, PROCESS_STATUS.REMOTE_PROCESSING, callback);
};

module.exports.setQueryTaskStatusRemoteServiceUnavailable = (queryId, callback) => {
  updateTaskStatus(queryId, PROCESS_STATUS.REMOTE_SERVICE_UNAVAILABLE, callback);
};

module.exports.setQueryTaskStatusRemoteFileNotFound = (queryId, callback) => {
  updateTaskStatus(queryId, PROCESS_STATUS.REMOTE_FILE_NOT_FOUND, callback);
};

module.exports.setQueryTaskStatusResultPackNotFound = (queryId, callback) => {
  updateTaskStatus(queryId, PROCESS_STATUS.RESULT_PACK_NOT_FOUND, callback);
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
    'status = @status, records = @records, updTime = @updTime, expTime = @expTime ' +
    'WHERE queryID = @queryId ';

  let request = _connector.queryRequest()
    .setInput('queryId', _connector.TYPES.NVarChar, queryId)
    .setInput('updTime', _connector.TYPES.DateTime, new Date())
    .setInput('expTime', _connector.TYPES.Date, moment().startOf('day').add(expire, expireUnit).toDate())
    .setInput('status', _connector.TYPES.NVarChar, PROCESS_STATUS.COMPLETE)
    .setInput('records', _connector.TYPES.BigInt, records)
    .setInput('archiveSizeInBytes', _connector.TYPES.BigInt, sizeInBytes)
    .setInput('archiveEntries', _connector.TYPES.NVarChar, entries);

  Q.nfcall(request.executeUpdate, sql).then(rowsAffected => {
    if (rowsAffected === 1) {
      callback(null, PROCESS_STATUS.COMPLETE);
    } else {
      throw new Error();
    }
  }).fail(err => {
    winston.error(`===update integration query task failed! (queryId=${queryId}, status=${status}): `, err);
    callback(err);
  });
};

module.exports.getQueryTask = (queryId, callback) => {
  const sql = 'SELECT task.queryID, task.status, task.records, log.crtTime, log.updUser, log.reserve2 as mode, ' +
    'task.archiveSizeInBytes, task.archiveEntries, log.criteria, task.expTime ' +
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

module.exports.getTasksByStatus = (status, callback) => {
  const sql = 'SELECT queryID FROM cu_IntegratedQueryTask WHERE status = @status';

  let request = _connector.queryRequest()
    .setInput('status', _connector.TYPES.NVarChar, status);

  Q.nfcall(request.executeQuery, sql).then(result => {
    callback(null, result);
  }).fail(error => {
    callback(error);
  });
};

module.exports.getTaskCriteriaByStatus = (status, callback) => {
  const sql = "SELECT task.queryID, reserve1 AS wrappedFrontSiteScript, queryScript AS backendCriteriaScript " +
    "FROM cu_IntegratedQueryTask task, cu_QueryLog log " +
    "WHERE task.queryID = log.queryID AND task.status = @status";

  let request = _connector.queryRequest()
    .setInput('status', _connector.TYPES.NVarChar, status);

  Q.nfcall(request.executeQuery, sql).then(result => {
    winston.info('result: ', result.length);
    callback(null, result);
  }).fail(error => {
    callback(error);
  });
};

module.exports.identicalQueryPoster = (queryId, wrappedFrontEndScript, backendScript, callback) => {
  const API_360_HOST = appConfig.get("API_360_HOST");
  const API_360_PORT = appConfig.get("API_360_PORT");

  let hasTag = ((wrappedFrontEndScript.criteria.tag.length + wrappedFrontEndScript.criteria.trail.length) > 0) ||
    (_.intersection(
      ['TagQtn', 'TagOwnMedia', 'TagOuterMedia', 'TagEInterest', 'TagEIntent', 'TagActive'],
      _.keys(wrappedFrontEndScript.export.relatives)
    ).length > 0);

  let requestUrl = null;
  let requestBody = null;
  if (hasTag) {
    requestUrl = `http://${API_360_HOST}:${API_360_PORT}/query_all/${queryId}`;
    requestBody = {
      req_owner: backendScript,
      req_log: wrappedFrontEndScript
    };
  } else {
    requestUrl = `http://${API_360_HOST}:${API_360_PORT}/query/${queryId}`;
    requestBody = backendScript;
  }

  request({
    url: requestUrl,
    method: 'POST',
    json: true,
    body: requestBody
  }, (error, response, body) => {
    if (error)
      callback(error, null);
    else
      callback(null, backendScript);
  });
};

module.exports.anonymousQueryPoster = (queryId, backendScript, callback) => {
  const API_360_HOST = appConfig.get("API_360_HOST");
  const API_360_PORT = appConfig.get("API_360_PORT");

  const requestUrl = `http://${API_360_HOST}:${API_360_PORT}/query_nonowner/${queryId}`;
  const requestBody = backendScript;

  request({
    url: requestUrl,
    method: 'POST',
    json: true,
    body: requestBody
  }, (error, response, body) => {
    if (error)
      callback(error, null);
    else
      callback(null, backendScript);
  });
};