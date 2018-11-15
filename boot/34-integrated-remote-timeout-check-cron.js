const Q = require('q');
const schedule = require('node-schedule');
const moment = require('moment');
const winston = require('winston');
const queue = require('../utils/queue');
const _connector = require('../utils/sql-query-util');
const integrationTaskService = require('../services/integration-analysis-task-service');

module.exports = (app) => {
  let dailyTaskReportCron = {
    minute: 33,
    hour: 8
  };

  // schedule.scheduleJob(`0 * * * * *`, () => {
  schedule.scheduleJob(`${dailyTaskReportCron.minute} ${dailyTaskReportCron.hour} * * *`, () => {
    const yesterday = moment().startOf('day').add(-1, 'day').valueOf();

    const sql = 'UPDATE cu_IntegratedQueryTask ' +
      'SET status = @timeout, updTime = @updTime ' +
      'WHERE status = @processing AND updTime < @startDate';

    const request = _connector.queryRequest()
      .setInput('timeout', _connector.TYPES.NVarChar, integrationTaskService.PROCESS_STATUS.REMOTE_PROCESSING_TIMEOUT)
      .setInput('processing', _connector.TYPES.NVarChar, integrationTaskService.PROCESS_STATUS.REMOTE_PROCESSING)
      .setInput('startDate', _connector.TYPES.DateTime, yesterday)
      .setInput('updTime', _connector.TYPES.DateTime, new Date());

    return Q.nfcall(request.executeUpdate, sql)
      .then(res => {
        queue.get(queue.TOPIC.INTEGRATED_QUERY_TRIGGER).next();
      }).fail(err => {
        winston.error('set remote processing task to timeout failed: ', err)
    });
  });

  return null;
};