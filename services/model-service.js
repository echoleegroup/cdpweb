'use strict'

const _ = require('lodash');
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

module.exports.getModel = (mdId, callback=() => {}) => {};

module.exports.getModelBatch = (mdId, batId, callback=() => {}) => {
  let sql =
    'SELECT mm.* ' +
    'FROM md_Model mm, md_Batch mb ' +
    'WHERE mm.mdID = mb.mdID and mm.batID = mb.batID and mm.mdID = @mdId and mm.batID = @batId';

  //preparedStatement
  /*
  let prepared = _connector.preparedStatement()
    .setType('mdID', mssql.NVarChar)
    .setType('batID', mssql.NVarChar);

  Q.nfcall(prepared.execute, modelSql, {
    mdID: req.query.mdID,
    batID: req.query.batID
  }).then((resultSet) => {
    winston.info('===resultSet: %j', resultSet);
    res.render('custom-search', {
      'id': req.session.userid,
      'modelInfo': resultSet[0],
      'modelList': modelList,
      'navMenuList': navMenuList,
      'mgrMenuList': mgrMenuList
    });
  }).fail((err) => {
    winston.error('===query model failed:', err);
  });
*/
  //winston.info('===_connector.execSqlByParams');
  Q.nfcall(_connector.execSqlByParams, sql, {
    mdID: {
      type: mssql.NVarChar,
      value: mdId
    },
    batID: {
      type: mssql.NVarChar,
      value: batId
    }
  }).then((resultSet) => {
    callback(null, resultSet[0]);
  }).fail((err) => {
    winston.error('===query model failed:', err);
    callback(err);
  });
};