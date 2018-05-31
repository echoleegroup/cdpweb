const Q = require('q');
const winston = require('winston');
const _connector = require('../utils/sql-query-util');

module.exports.initTaskLog = (task, triggerTime, stage, stageMsg, stageTime, message, callback) => {
  const sql = 'INSERT INTO sy_TaskLog (task, triggerTime, stage, stageTime, stageMsg, message, crtTime, updTime) ' +
    'OUTPUT INSERTED.logID ' +
    'VALUES (@task, @triggerTime, @stage, @stageTime, @stageMsg, @message, @crtTime, @updTime)';

  let now = new Date();
  let request = _connector.queryRequest()
    .setInput('task', _connector.TYPES.NVarChar, task)
    .setInput('triggerTime', _connector.TYPES.DateTime, new Date(triggerTime))
    .setInput('stage', _connector.TYPES.SmallInt, stage)
    .setInput('stageTime', _connector.TYPES.DateTime, new Date(stageTime))
    .setInput('stageMsg', _connector.TYPES.NVarChar, stageMsg)
    .setInput('message', _connector.TYPES.NVarChar, message)
    .setInput('crtTime', _connector.TYPES.DateTime, now)
    .setInput('updTime', _connector.TYPES.DateTime, now);

  // Q.nfcall(request.executeQuery, sql).then(result => {
  //   winston.info(`===insertQueryLog result: ${result}`);
  // });
  Q.nfcall(request.executeQuery, sql).then(result => {
    winston.info('init task log result: ', result);
    callback(null, result[0]);
  }).fail(err => {
    winston.error('===insert task log failed! : ', err);
    callback(err);
  });
};

module.exports.updateTaskLog = (logId, stage, stageTime, stageMsg, taskResult, message, debugMsg, callback) => {
  const sql = 'UPDATE sy_TaskLog ' +
    'SET stage = @stage, stageTime = @stageTime, stageMsg = @stageMsg, ' +
    'taskResult = @taskResult, message = @message, debugMsg = @debugMsg, updTime = @updTime ' +
    'OUTPUT INSERTED.logID ' +
    'WHERE logID = @logId ';

  let request = _connector.queryRequest()
    .setInput('logId', _connector.TYPES.BigInt, logId)
    .setInput('stage', _connector.TYPES.SmallInt, stage)
    .setInput('stageTime', _connector.TYPES.DateTime, new Date(stageTime))
    .setInput('stageMsg', _connector.TYPES.NVarChar, stageMsg)
    .setInput('taskResult', _connector.TYPES.SmallInt, taskResult)
    .setInput('message', _connector.TYPES.NVarChar, message)
    .setInput('debugMsg', _connector.TYPES.NVarChar, debugMsg)
    .setInput('updTime', _connector.TYPES.DateTime, new Date());

  Q.nfcall(request.executeQuery, sql).then(result => {
    console.log('result', result);
    callback(null, result[0]);
  }).fail(err => {
    winston.error('===update task log failed! : ', err);
    callback(err);
  });
};