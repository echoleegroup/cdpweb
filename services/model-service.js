'use restrict'

const Q = require('q');
const mssql = require('mssql');
const winston = require('winston');
const _connector = require('../utils/sql-query-util');

module.exports.getModels = (callback=() => { }) => {
  let sql = 'SELECT mdID,mdName,batID FROM md_Model ORDER BY updTime desc';

  Q.nfcall(_connector.execSqlByParams, sql, {}).then((resultSet) => {
    callback(null, resultSet);
  }).fail(err => {
    winston.error('====[getModels] get all models failed: ', err);
    callback(err);
  })
};