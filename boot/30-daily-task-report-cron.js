let schedule = require('node-schedule');
let moment = require('moment');

module.exports = (app) => {
  let dailyTaskReportCron = {
    minute: 50,
    hour: 8
  };

  // schedule.scheduleJob(`0 * * * * *`, () => {
  schedule.scheduleJob(`${dailyTaskReportCron.minute} ${dailyTaskReportCron.hour} * * *`, () => {
    let daileTaskJobReportApp = require('../applications/daily-task-job-report');
    let endTime = moment().minutes(dailyTaskReportCron.minute).hours(dailyTaskReportCron.hour).startOf('minute').valueOf();
    let startTime = moment(endTime).add(-1, 'day').valueOf();
    daileTaskJobReportApp.failureDailyTaskReport(startTime, endTime);
  });
};