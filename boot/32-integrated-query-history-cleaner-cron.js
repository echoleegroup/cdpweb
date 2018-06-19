const _ = require('lodash');
const fs = require('fs');
const path = require('path');
const Q = require('q');
const schedule = require('node-schedule');
const winston = require('winston');
const moment = require('moment');
const constants = require('../utils/constants');
const _connector = require('../utils/sql-query-util');

module.exports = (app) => {
  let dailyTaskReportCron = {
    minute: 33,
    hour: 5
  };

  // schedule.scheduleJob(`0 * * * * *`, () => {
  schedule.scheduleJob(`${dailyTaskReportCron.minute} ${dailyTaskReportCron.hour} * * *`, () => {
    const today = moment().startOf('day').toDate();
    const yesterday = moment().startOf('day').add(-1, 'day').toDate();

    const sqlQueryLog =
      'SELECT queryID FROM cu_IntegratedQueryTask WHERE expTime < @today AND expTime >= @yesterday';

    const sqlDelStatistic =
      'DELETE FROM cu_IntegratedQueryStatistic ' +
      `WHERE queryID in (${sqlQueryLog})`;

    const sqlDelStatisticChart =
      'DELETE FROM cu_IntegratedQueryStatisticChart ' +
      `WHERE queryID in (${sqlQueryLog})`;

    // const sqlUpdateIntegratedQueryTaskStatus =
    //   `UPDATE cu_IntegratedQueryTask SET status = @status WHERE queryID in (${sqlQueryLog})`;

    const request = _connector.queryRequest()
      .setInput('today', _connector.TYPES.DateTime, today)
      .setInput('yesterday', _connector.TYPES.DateTime, yesterday);

    Q.all([
      Q.nfcall(request.executeQuery, sqlQueryLog),
      Q.nfcall(request.executeUpdate, sqlDelStatistic),
      Q.nfcall(request.executeUpdate, sqlDelStatisticChart),
      // Q.nfcall(request.executeUpdate, sqlUpdateIntegratedQueryTaskStatus)
    ]).spread((queryLogs, ...restUpdates) => {
      _.forEach(queryLogs, queryLog => {
        let sparkFeedbackFile = path.join(constants.ASSERTS_SPARK_FEEDBACK_PATH_ABSOLUTE, `${queryLog.queryID}.zip`);
        let sparkAnalysisFile = path.join(constants.ASSERTS_SPARK_INTEGRATED_ANALYSIS_ASSERTS_PATH_ABSOLUTE, `${queryLog.queryID}.zip`);

        fs.existsSync(sparkFeedbackFile) &&
        fs.unlink(sparkFeedbackFile, err => {
          winston.warn(`delete expired file ${sparkFeedbackFile} failed`);
        });

        fs.existsSync(sparkAnalysisFile) &&
        fs.unlink(sparkAnalysisFile, err => {
          winston.warn(`delete expired file ${sparkAnalysisFile} failed`);
        });
      });

    }).fail(err => {
      winston.error('clean expired integrated-query history failed! ', err);
    });
  });
};