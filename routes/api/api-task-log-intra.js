const _ = require('lodash');
const express = require('express');
const Q = require('q');
const winston = require('winston');
const factory = require("../../middlewares/response-factory");
const taskLogService = require('../../services/task-log-service');

module.exports = (app) => {
  winston.info('[api-model] Creating api-integration-analysis route.');
  const router = express.Router();

  router.post('/init', factory.ajax_response_factory(), (req, res) => {
    const task = req.body.task;
    const triggerTime = Number(req.body.triggerTime);
    const stage = 1;
    const stageMsg = req.body.stageMsg;
    const message = req.body.message;

    if (_.isEmpty(task)) {
      return res.json(null, 301, 'task name is necessary');
    } else if (!_.isNumber(triggerTime)) {
      return res.json(null, 302, 'triggerTime should be a timestamp in number');
    }

    Q.nfcall(taskLogService.initTaskLog, task, triggerTime, stage, stageMsg, triggerTime, message).then(resData => {
      res.json(resData);
    }).fail(err => {
      winston.error('initialize task log failed: ', err);
      console.log(err);
      res.json(null, 500, 'internal service error!');
    });
  });

  router.post('/:logId/complete', factory.ajax_response_factory(), (req, res) => {
    const logId = req.params.logId;
    const stage = 0;
    const stageTime = Number(req.body.stageTime);
    const stageMsg = req.body.stageMsg;
    const taskResult = Number(req.body.taskResult);
    const message = req.body.message;
    const debugMsg = req.body.debugMsg;

    if (_.isEmpty(logId)) {
      return res.json(null, 301, 'log id is necessary');
    } else if (!_.isNumber(stageTime)) {
      return res.json(null, 302, 'triggerTime should be a timestamp in number');
    } else if (!_.isNumber(taskResult)) {
      return res.json(null, 303, 'task result is necessary');
    } else if ([1,2,3].indexOf(taskResult) < 0) {
      return res.json(null, 304, 'invalid task result');
    }

    Q.nfcall(taskLogService.updateTaskLog, logId, stage, stageTime, stageMsg, taskResult, message, debugMsg).then(resData => {
      res.json(resData);
    }).fail(err => {
      winston.error('update task log failed: ', err);
      res.json(null, 500, 'internal service error!');
    });
  });

  router.post('/:logId/update', factory.ajax_response_factory(), (req, res) => {
    const logId = req.params.logId;
    const stage = req.body.stage;
    const stageTime = Number(req.body.stageTime);
    const stageMsg = req.body.stageMsg;
    const message = req.body.message;

    if (_.isEmpty(logId)) {
      return res.json(null, 301, 'log id is necessary');
    } else if (!_.isNumber(stage) || stage === 0 || stage === 1) {
      return res.json(null, 302, 'invalid stage.');
    } else if (!_.isNumber(stageTime)) {
      return res.json(null, 303, 'triggerTime should be a timestamp in number');
    }

    Q.nfcall(taskLogService.updateTaskLog, logId, stage, stageTime, stageMsg, null, message, null).then(resData => {
      res.json(resData);
    }).fail(err => {
      winston.error('update task log failed: ', err);
      res.json(null, 500, 'internal service error!');
    });
  });

  return router;
};