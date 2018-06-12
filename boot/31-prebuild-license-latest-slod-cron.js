const _ = require('lodash');
const schedule = require('node-schedule');
const Sequelize = require('sequelize');
const moment = require('moment');
const winston = require('winston');
const sequelizeInst = require('../utils/sequelize-instance');

const prebuild = () => {};

module.exports = (app) => {
  /*
  const dailyTaskReportCron = {
    minute: 33,
    hour: 7
  };

  schedule.scheduleJob(`0 * * * * *`, () => {
  // schedule.scheduleJob(`${dailyTaskReportCron.minute} ${dailyTaskReportCron.hour} * * *`, () => {
    const tableName = 'cu_LicsLatestSlod_';
    const tempTableName = `${tableName}_${_.random(1, 999)}`;
    const queryInterface = sequelizeInst.getQueryInterface();
    queryInterface.createTable(tempTableName, {
      LICSNO: {
        type: Sequelize.STRING,
        primaryKey: true,
        allowNull: false
      },
      CNTRNO: {
        type: Sequelize.STRING,
        allowNull: false
      },
      ORDDT: {
        type: Sequelize.DATE,
        allowNull: false
      },
      crtTime: {
        type: Sequelize.DATE,
        allowNull: false
      }
    }, {
      timestamps: false,
    }).then(() => {
      winston.info(`table ${tempTableName} is created`);
      const sql = '';
    }).then(() => {
      // drop
      return sequelizeInst.getQueryInterface().dropTable(tempTableName);
    }).then(() => {
      // rename
      return sequelizeInst.getQueryInterface().renameTable(tempTableName, tableName);
    }).then(() => {
      winston.info(`table ${tableName} is renamed`);
    }).catch(error => {
      winston.error(error);
    })
  });
  */
};