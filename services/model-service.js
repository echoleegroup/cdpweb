'use strict'

const _ = require('lodash');
const Q = require('q');
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

module.exports.getModel = (mdId, callback=() => {}) => {};

module.exports.getModelBatch = (mdId, batId, callback=() => {}) => {
  let sql =
    'SELECT mm.* ' +
    'FROM md_Model mm, md_Batch mb ' +
    'WHERE mm.mdID = mb.mdID and mm.batID = mb.batID and mm.mdID = @mdId and mm.batID = @batId';

  //preparedStatement
  /*
  let prepared = _connector.preparedStatement()
    .setType('mdId', _connector.TYPES.NVarChar)
    .setType('batId', _connector.TYPES.NVarChar);

  Q.nfcall(prepared.execute, sql, {
    mdId: mdId,
    batId: batId
  }).then((resultSet) => {
    winston.info('===resultSet: %j', resultSet[0]);
    callback(null, resultSet[0]);
  }).fail((err) => {
    winston.error('===query model failed:', err);
  });
  //winston.info('===_connector.execSqlByParams');
  */
  Q.nfcall(_connector.execSqlByParams, sql, {
    mdId: {
      type: _connector.TYPES.NVarChar,
      value: mdId
    },
    batId: {
      type: _connector.TYPES.NVarChar,
      value: batId
    }
  }).then((resultSet) => {
    callback(null, resultSet[0]);
  }).fail((err) => {
    winston.error('===query model failed:', err);
    callback(err);
  });
};