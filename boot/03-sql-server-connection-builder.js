const winston = require('winston');
const pool = require('../utils/connection-pool');

module.exports = (app) => {
  return new Promise((resolve, reject) => {
    pool.connect(err => {
      if (err) {
        winston.error('sql server connect failed: ', err);
        reject(err);
      }
      resolve(null);
    });
  });
};