const Q = require('q');
const path = require('path');
const winston = require('winston');
const queue = require('../utils/queue');
const constants = require('../utils/constants');
const integratedAnalysisHelper = require('../helpers/integrated-analysis-helper');
const integrationTaskService = require('../services/integration-analysis-task-service');

module.exports = (app) => {
  return Q.nfcall(integrationTaskService.getTasksByStatus, integrationTaskService.PROCESS_STATUS.PARSING)
    .then(tasks => {
      tasks.forEach(task => {
        const queryId = task.queryID;
        const sparkZipPath = path.join(constants.ASSERTS_SPARK_FEEDBACK_PATH_ABSOLUTE, `${queryId}.zip`);
        queue.push(queryId, integratedAnalysisHelper.getIntegratedQueryPackParser(queryId, sparkZipPath));
      });
    }).fail(err => {
      winston.error('get parsing integrated query task failed: ', err);
    });
};