'use strict';

const winston = require('winston');
const Umzug = require('umzug');
const Sequelize = require('sequelize');
const appConfig = require('../app-config');

const logUmzugEvent = (eventName) => {
  return (name) => {
    winston.info('[MIGRATION] [%s]', name, eventName);
  };
};

module.exports = (app) => {
  if ('TEST' === process.env.RUNTIME) {
    return;
  }

  const SQL_SERVER_INFO = appConfig.get('SQL_SERVER_INFO');
  const sequelize = new Sequelize(
    process.env.DATABASE_NAME,
    process.env.DATABASE_USERNAME,
    process.env.DATABASE_PASSWORD,
    {
      host: SQL_SERVER_INFO.host,
      port: SQL_SERVER_INFO.port,
      dialect: SQL_SERVER_INFO.dialect,
      dialectOptions: SQL_SERVER_INFO.options
    }
  );
  const umzug = new Umzug({
    storage: 'sequelize',
    storageOptions: {
      sequelize: sequelize,
    },
    migrations: {
      params: [
        sequelize.getQueryInterface(),
        sequelize.constructor.DataTypes,
        sequelize,
        () => {
          throw new Error('Migration failed');
        }
      ],
      path: './migrations',
      pattern: /^\d+[\w-]+\.js$/,
    },
    logging: false
  });

  umzug.on('migrating', logUmzugEvent('migrating'));
  umzug.on('migrated', logUmzugEvent('migrated'));

  sequelize.sync({ force: false }).catch(err => {
    winston.error('=== [Model] Sync defined models failed:', err);
  }).finally(() => {
    umzug.up();
    winston.info('=== [Model] All defined models loadled');
  });
  /*
  Rx.Observable.fromPromise()
    .subscribe(
      (result) => {
      },
      (err) => {
        winston.error('=== [Model] Sync defined models failed:', err);
      }, () => {
        umzug.up();
        winston.info('=== [Model] All defined models loadled');
      }
    );
    */
};

