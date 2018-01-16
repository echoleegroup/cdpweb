'use strict'

const Q = require('q');
const winston = require('winston');
const _connector = require('../utils/sql-query-util');

module.exports.loginPlatform = (username, password, callback = () => { }) => {
  const sql = 'SELECT * FROM sy_infouser WHERE userId = @username and password = @password';
  Q.nfcall(_connector.execParameterizedSql, sql, {
    username: {
      type: _connector.TYPES.NVarChar,
      value: username
    },
    password: {
      type: _connector.TYPES.NVarChar,
      value: password
    }
  }).then((resultSet) => {
    if (resultSet.length === 1) {
      return callback(null, resultSet[0]);
    } else if (resultSet.length === 0) {
      return callback(null, null);
    } else {
      winston.error('====[loginPlatform] multi users response (userId=%s): ', username);
      return callback(new Error('multi users response'));
    }
  }).fail((err) => {
    winston.error('====[loginPlatform] query sy_infouser failed: ', err);
    return callback(err);
  });
};

module.exports.updateLoginTime = (userId, callback = () => {}) => {
  let sql = "UPDATE sy_infouser set loginTime = GETDATE() where userId = @userId";
  Q.nfcall(_connector.execParameterizedSql, sql, {
    userId: {
      type: _connector.TYPES.NVarChar,
      value: userId
    }
  }).then((resultSet) => {
    return callback(null, resultSet);
  }).fail(err => {
    return callback(err);
  });
};