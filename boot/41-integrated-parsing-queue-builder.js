const winston = require('winston');
const queue = require('../utils/queue');
const integratedAnalysisHelper = require('../helpers/integrated-analysis-helper');
const integrationTaskService = require('../services/integration-analysis-task-service');

module.exports = (app) => {
  Q.nfcall(integrationTaskService.getTasksByStatus, integrationTaskService.PROCESS_STATUS.PARSING)
    .then(tasks => {
      queue.push(integratedAnalysisHelper.getIntegratedQueryPackParser(task.queryID));
    }).fail(err => {
    winston.error('get parsing integrated query task failed: ', err);
  });
};