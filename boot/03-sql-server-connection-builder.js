const winston = require('winston');
const pool = require('../utils/connection-pool');

module.exports = (app) => {
  return pool.connect().then(conn => {
    return conn.request().query('SELECT 1 AS number');
  }).then(resp => {
    winston.info('sql server connection established.');
    return null;
  }).catch(err => {
    winston.error('sql server connection failed: ', err);
  });
};