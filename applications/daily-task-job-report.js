const Q = require('q');
const moment = require('moment');
const appConfig = require('../app-config');
const winston = require('winston');
const taskLogService = require('../services/task-log-service');
const mailUtil = require('../utils/mail-util');
const RESULT_MAP = {
  0: '正常結束', 1: '錯誤', 2: '警告'
};

module.exports.failureDailyTaskReport = (startTime, endTime) => {
  let completeStage = 0;
  let failureResult = 1;
  Q.nfcall(taskLogService.getTaskLog, {
    startTime,
    endTime,
    stage: completeStage,
    result: failureResult
  }).then(failureTasks => {
    if (failureTasks.length > 0 ) {
      let tasks = failureTasks.map(task => {
        return {
          task: task.task,
          triggerTime: moment(task.triggerTime).utc().format('YYYY-MM-DD hh:mm'),
          stageTime: moment(task.stageTime).utc().format('YYYY-MM-DD hh:mm'),
          taskResult: RESULT_MAP[task.taskResult],
          message: task.message
        }
      });
      mailUtil.sendByTemplate('101', appConfig.get('SYSTEM_MANAGER_MAIL'),
        `${appConfig.get('PLATFORM')} - 排程錯誤回報`, {tasks});
    }
  });
};