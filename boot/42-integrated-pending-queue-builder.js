const Q = require('q');
const path = require('path');
const winston = require('winston');
const queue = require('../utils/queue');
const constants = require('../utils/constants');
const integratedAnalysisHelper = require('../helpers/integrated-analysis-helper');
const integrationTaskService = require('../services/integration-analysis-task-service');
const _queue = queue.get(queue.TOPIC.INTEGRATED_QUERY_TRIGGER);

module.exports = (app) => {
  integratedAnalysisHelper.isQueryServiceDisabled() && _queue.suspend();

  return Q.nfcall(
    integrationTaskService.getTaskCriteriaByStatus, integrationTaskService.PROCESS_STATUS.PENDING).then(tasks => {
    tasks.forEach(task => {

      const queryId = task.queryID;
      const queryScriptStage2 = JSON.parse(task.queryScriptStage2);
      const queryScriptStage3 = JSON.parse(task.queryScriptStage3);
      const mode = task.mode;

      let handler = integratedAnalysisHelper.getQueryPosterHandler(queryId, mode, queryScriptStage2, queryScriptStage3);
      Q.nfcall(integrationTaskService.updateResumeTime, queryId);

      _queue.push(queryId, handler);
    });
  });
  //
  //
  //
  //
  // return Q.nfcall(integrationTaskService.getTasksByStatus, integrationTaskService.PROCESS_STATUS.PARSING)
  //   .then(tasks => {
  //     tasks.forEach(task => {
  //       const queryId = task.queryID;
  //       const sparkZipPath = path.join(constants.ASSERTS_SPARK_FEEDBACK_PATH_ABSOLUTE, `${queryId}.zip`);
  //       queue.push(queryId, integratedAnalysisHelper.getIntegratedQueryPackParser(queryId, sparkZipPath));
  //     });
  //   }).fail(err => {
  //     winston.error('get parsing integrated query task failed: ', err);
  //   });
};