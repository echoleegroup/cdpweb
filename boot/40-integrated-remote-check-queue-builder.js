const Q = require('q');
const moment = require('moment');
const winston = require('winston');
const queue = require('../utils/queue');
const _connector = require('../utils/sql-query-util');
const taskService = require('../services/integration-analysis-task-service');
const integratedAnalysisHelper = require('../helpers/integrated-analysis-helper');
const integrationTaskService = require('../services/integration-analysis-task-service');

module.exports = (app) => {
  const sql = 'SELECT queryID FROM cu_IntegratedQueryTask WHERE status = @status AND crtTime >= @crtTime';

  let request = _connector.queryRequest()
    .setInput('status', _connector.TYPES.NVarChar, taskService.PROCESS_STATUS.REMOTE_PROCESSING)
    .setInput('crtTime', _connector.TYPES.DateTime, moment().startOf('day').add(-3, 'day').toDate());

  return Q.nfcall(request.executeQuery, sql).then(tasks => {
    tasks.forEach(task => {
      const processor = () => {
        const queryId = task.queryID;
        // const sparkZipPath = path.join(constants.ASSERTS_SPARK_FEEDBACK_PATH_ABSOLUTE, `${queryId}.zip`);
        // const remoteDownloadUrl = `http://10.201.2.130:11002/download/${queryId}`;
        const remoteDeleteUrl = `http://10.201.2.130:11002/delete/${queryId}`;

        return Q.nfcall(integratedAnalysisHelper.downloadQueryResultPack, queryId)
          .fail(err => {
            throw err;
          }).then(resultPackPath => {
            return Q.nfcall(integrationTaskService.setQueryTaskStatusParsing, queryId)
              .then(() => {
                require('request-promise-native').post(remoteDeleteUrl);
                queue.push(integratedAnalysisHelper.getIntegratedQueryPackParser(queryId));
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

      queue.push(processor);
    });
  }).fail(err => {
    console.log(err);
    winston.error('get remote processing integrated query task failed: ', err);
  });
};