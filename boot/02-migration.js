'use strict';

const winston = require('winston');
const Umzug = require('umzug');
const Sequelize = require('sequelize');
const sequelizeInst = require('../utils/sequelize-instance');

const logUmzugEvent = (eventName) => {
  return (name) => {
    winston.info('[MIGRATION] [%s]', name, eventName);
  };
};

module.exports = (app) => {
  if ('TEST' === process.env.RUNTIME) {
    return;
  }

  const umzug = new Umzug({
    storage: 'sequelize',
    storageOptions: {
      sequelize: sequelizeInst,
    },
    migrations: {
      params: [
        sequelizeInst.getQueryInterface(),
        Sequelize,
        sequelizeInst,
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

  sequelizeInst.sync({ force: false }).catch(err => {
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

