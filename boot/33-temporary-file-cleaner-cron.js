const fs = require('fs');
const path = require('path');
const schedule = require('node-schedule');
const moment = require('moment');
const constants = require('../utils/constants');

module.exports = (app) => {
  let dailyTaskReportCron = {
    minute: 33,
    hour: 11
  };

  // schedule.scheduleJob(`0 * * * * *`, () => {
  schedule.scheduleJob(`${dailyTaskReportCron.minute} ${dailyTaskReportCron.hour} * * *`, () => {
    const today = moment().startOf('day').valueOf();

    fs.readdirSync(constants.ASSERTS_CUSTOM_TARGET_ASSERTS_PATH_ABSOLUTE).forEach(file => {
      let filePath = path.resolve(constants.ASSERTS_CUSTOM_TARGET_ASSERTS_PATH_ABSOLUTE, file);
      let stat = fs.statSync(filePath);
      if (!stat.isDirectory() && file.indexOf('.') < 0 && stat.atimeMs < today) {
        fs.unlinkSync(filePath);
      }
    });
  });

  return null;
};