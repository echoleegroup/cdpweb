'use strict';

const fs = require('fs');
const path = require('path');
const winston = require('winston');
const moment = require('moment');
const DailyRotateFile = require('winston-daily-rotate-file');

const constants = require('../utils/constants');

module.exports = () => {
  const transports = [];
  winston.level = process.env.LOG_LEVEL ? process.env.LOG_LEVEL : 'info';


  const consoleLogger = new winston.transports.Console({
    timestamp: () => {
      //return (new Date().toISOString()).replace(/\..+/, '').replace(/T/, ' ');
      return moment().format('YYYY-MM-DD HH:mm:ss.SSS');
    },
    formatter: (options) => {
      return winston.config.colorize(options.level, options.timestamp() + ' ') +
        winston.config.colorize(options.level, options.level.toUpperCase()) + ' ' +
        (options.message ? options.message : '') +
        (options.meta && Object.keys(options.meta).length ? '\n\t' + JSON.stringify(options.meta) : '');
    }
  });
  transports.push(consoleLogger);

  try {
    fs.mkdirSync(path.join(__dirname, '../' + constants.LOG_FOLDER_PATH));
  } catch (ignored_err) {
  }

  if ('production' === process.env.NODE_ENV) {
    const dailyRotateLoggerInfo = new DailyRotateFile({
      name: 'dailyRotateLoggerInfo',
      dirname: constants.LOG_FOLDER_PATH,
      datePattern: 'yyyy-MM-dd.',
      level: 'info',
      json: false,
      prepend: true,
      timestamp: () => {
        return moment().format('YYYY-MM-DD HH:mm:ss.SSS');
      },
      formatter: (options) => {
        return winston.config.colorize(options.level, options.timestamp() + ' ') +
          winston.config.colorize(options.level, options.level.toUpperCase()) + ' ' +
          (options.message ? options.message : '') +
          (options.meta && Object.keys(options.meta).length ? '\n\t' + JSON.stringify(options.meta) : '');
      }
    });
    const dailyRotateLoggerError = new DailyRotateFile({
      name: 'dailyRotateLoggerError',
      dirname: constants.LOG_FOLDER_PATH,
      datePattern: 'yyyy-MM-dd.error.',
      level: 'error',
      json: false,
      prepend: true,
      timestamp: () => {
        return moment().format('YYYY-MM-DD HH:mm:ss.SSS');
      },
      formatter: (options) => {
        return winston.config.colorize(options.level, options.timestamp() + ' ') +
          winston.config.colorize(options.level, options.level.toUpperCase()) + ' ' +
          (options.message ? options.message : '') +
          (options.meta && Object.keys(options.meta).length ? '\n\t' + JSON.stringify(options.meta) : '');
      }
    });

    transports.push(dailyRotateLoggerInfo);
    transports.push(dailyRotateLoggerError);
  }

  winston.configure({
    transports: transports
  });
};