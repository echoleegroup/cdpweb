const Q = require('q');
const moment = require('moment');
const winston = require('winston');
const appConfig = require("../app-config");
const queue = require('../utils/queue');
const _connector = require('../utils/sql-query-util');
const taskService = require('../services/integration-analysis-task-service');
const integratedAnalysisHelper = require('../helpers/integrated-analysis-helper');
const integrationTaskService = require('../services/integration-analysis-task-service');

module.exports = (app) => {
  const sql = 'SELECT queryID FROM cu_IntegratedQueryTask WHERE status = @status AND crtTime >= @crtTime';

  let request = _connector.queryRequest()
    .setInput('status', _connector.TYPES.NVarChar, taskService.PROCESS_STATUS.REMOTE_PROCESSING)
    .setInput('crtTime', _connector.TYPES.DateTime, moment().startOf('day').add(-5, 'day').toDate());

  return Q.nfcall(request.executeQuery, sql).then(tasks => {
    tasks.forEach(task => {
      const queryId = task.queryID;

      const processor = () => {
        winston.info('integrated query task start to download: ', queryId);

        const requestUrl = `http://${appConfig.get("API_360_HOST")}:${appConfig.get("API_360_PORT")}`;
        const remoteDownloadUrl = `${requestUrl}/download/${queryId}`;
        const remoteDeleteUrl = `${requestUrl}/delete/${queryId}`;

        return Q.nfcall(integratedAnalysisHelper.downloadQueryResultPack, queryId, remoteDownloadUrl)
          .fail(err => {
            throw err;
          }).then(resultPackPath => {
            return Q.nfcall(integrationTaskService.setQueryTaskStatusParsing, queryId)
              .then(status => {
                //download finished. Fire next query script. Must be fired after update current task status.
                queue.get(queue.TOPIC.INTEGRATED_QUERY_TRIGGER).next();

                require('request-promise-native').post(remoteDeleteUrl);
                return queue
                  .get(queue.TOPIC.INTEGRATED_QUERY_PARSER)
                  .push(queryId, integratedAnalysisHelper.getIntegratedQueryPackParser(queryId, resultPackPath));
              }).fail(err => {
                winston.error('update query task status to parsing failed(task=%j): ', task, err);
                throw err;
              });
          }).fail(err => {
            if (!err) {
              return Q();
            }
            throw err;
          });

      };  //end of processor

      queue.get(queue.TOPIC.INTEGRATED_REMOTE_CHECKER).push(queryId, processor);
    });
  }).fail(err => {
    winston.error(err);
    winston.error('get remote processing integrated query task failed: ', err);
  });
};