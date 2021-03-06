'use strict';

const express = require('express');
const path = require('path');
const winston = require('winston');
const Q = require('q');
// const _ = require('lodash');
const factory = require("../../middlewares/response-factory");
const integratedHelper = require('../../helpers/integrated-analysis-helper');
const integratedAnalysisHelper = require('../../helpers/integrated-analysis-helper');
const integrationTaskService = require('../../services/integration-analysis-task-service');
const queryLogService = require('../../services/query-log-service');
// const integrationAnalysisService = require('../../services/integration-analysis-statistic-service');
const constants = require('../../utils/constants');
const queue = require('../../utils/queue');

module.exports = (app) => {
  winston.info('[api-model] Creating api-integration-analysis-intra route.');
  const router = express.Router();

  router.get('/query/disable', factory.ajax_response_factory(), (req, res) => {
    integratedHelper.disableQueryService();
    queue.get(queue.TOPIC.INTEGRATED_QUERY_TRIGGER).suspend();
    res.json('service disabled');
  });

  router.get('/query/resume', factory.ajax_response_factory(), (req, res) => {
    integratedHelper.resumeQueryService();
    queue.get(queue.TOPIC.INTEGRATED_QUERY_TRIGGER).resume();

    // integratedHelper.resumeQueryService();
    res.json('service resumed');
  });

  router.get('/export/query/redo/:queryId', factory.ajax_response_factory(), (req, res) => {
    const queryId = req.params.queryId;
    Q.all([
      Q.nfcall(queryLogService.getQueryLog, queryId),
      Q.nfcall(integrationTaskService.getQueryTask, queryId)
    ]).spread((queryLog, task) => {
      if (!task || !queryLog) {
        return res.json(null, 401, `task ${queryId} not found`);
      }

      return Q.nfcall(integrationTaskService.setQueryTaskStatusPending, queryId, task.queryScript).then(status => {
        const queryScriptStage3 = JSON.parse(task.queryScript);
        const queryScriptStage2 = JSON.parse(queryLog.reserve1);
        const mode = queryLog.reserve2;

        let handler = integratedHelper.getQueryPosterHandler(queryId, mode, queryScriptStage2, queryScriptStage3);

        queue.get(queue.TOPIC.INTEGRATED_QUERY_TRIGGER).push(queryId, handler).next();

        Q.nfcall(integrationTaskService.updateResumeTime, queryId);
        res.json({status});
      });

    }).fail(err => {
      winston.error('re-do integrated query task failed: ', err);
      return res.json(null, 500, 'internal service error');
    });

  });

  router.get('/export/query/parsing/:queryId', factory.ajax_response_factory(), (req, res) => {
    const queryId = req.params.queryId;
    Q.nfcall(integrationTaskService.getQueryTaskDetail, queryId).then(task => {
      if (!task) {
        return res.json(null, 401, `task ${queryId} not found`);
      }

      return Q.nfcall(integrationTaskService.setQueryTaskStatusParsing, queryId).then(status => {
        res.json({status});
        const resultPackPath = path.join(constants.ASSERTS_SPARK_FEEDBACK_PATH_ABSOLUTE, `${queryId}.zip`);
        queue
          .get(queue.TOPIC.INTEGRATED_QUERY_PARSER)
          .push(queryId, integratedAnalysisHelper.getIntegratedQueryPackParser(queryId, resultPackPath));
      }).fail(err => {
        winston.error('update query task status to parsing failed(task=%j): ', task, err);
        return res.json(null, 500, 'internal service error');
      });

    }).fail(err => {
      winston.error('get integrated query task failed: ', err);
      return res.json(null, 500, 'internal service error');
    });
  });

  router.get('/export/query/ready/:ip/:port/:queryId', factory.ajax_response_factory(), (req, res) => {
    const queryId = req.params.queryId;
    Q.nfcall(integrationTaskService.getQueryTaskDetail, queryId).then(task => {
      if (!task) {
        return res.json(null, 401, `task ${queryId} not found`);
      }

      const remoteDownloadUrl = `http://${req.params.ip}:${req.params.port}/download/${queryId}`;
      const remoteDeleteUrl = `http://${req.params.ip}:${req.params.port}/delete/${queryId}`;
      return Q.nfcall(integratedAnalysisHelper.downloadQueryResultPack, queryId, remoteDownloadUrl).then(resultPackPath => {

        return Q.nfcall(integrationTaskService.setQueryTaskStatusParsing, queryId)
          .then(status => {
            res.json({status});

            //download finished. Fire next query script. Must be fired after update current task status.
            queue.get(queue.TOPIC.INTEGRATED_QUERY_TRIGGER).next('api-integration-analysis-intra.js');

            require('request-promise-native').post(remoteDeleteUrl);
            return queue
              .get(queue.TOPIC.INTEGRATED_QUERY_PARSER)
              .push(queryId, integratedAnalysisHelper.getIntegratedQueryPackParser(queryId, resultPackPath));
          }).fail(err => {
            winston.error('update query task status to parsing failed(task=%j): ', task, err);
            return res.json(null, 500, 'internal service error');
          });
      }).fail(err => {
        winston.error('download query result pack(queryId=%s) failed: ', queryId,  err);
        Q.nfcall(integrationTaskService.setQueryTaskStatusRemoteFileNotFound, queryId);
        return res.json(null, 404, `${queryId}.zip not found`);
      })
    }).fail(err => {
      winston.error('get integrated query task failed: ', err);
      return res.json(null, 500, 'internal service error');
    });
  });

  return router;
};