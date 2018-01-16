'use strict'

const Q = require('q');
const winston = require('winston');
const _connector = require('../utils/sql-query-util');

module.exports.loginPlatform = (username, password, callback = () => { }) => {
  const sql = 'SELECT * FROM sy_infouser WHERE userId = @username and password = @password';
  let request = _connector.queryRequest()
    .setInput('username', _connector.TYPES.NVarChar, username)
    .setInput('password', _connector.TYPES.NVarChar, password);;
  Q.nfcall(request.executeQuery, sql).then((resultSet) => {
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
  Q.nfcall(_connector.queryRequest()
    .setInput('userId', _connector.TYPES.NVarChar, userId)
    .executeQuery, sql).then((resultSet) => {
    return callback(null, resultSet);
  }).fail(err => {
    return callback(err);
  });
};