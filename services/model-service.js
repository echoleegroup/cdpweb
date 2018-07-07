'use strict'

const _ = require('lodash');
const Q = require('q');
const winston = require('winston');
const _connector = require('../utils/sql-query-util');

module.exports.getModels = (callback=() => { }) => {
  let sql = 'SELECT mdID,mdName,batID FROM md_Model ORDER BY updTime desc';

  Q.nfcall(_connector.execSql, sql).then((resultSet) => {
    callback(null, resultSet);
  }).fail(err => {
    winston.error('====[getModels] get all models failed: ', err);
    callback(err);
  })
};

module.exports.getModel = (mdId, callback=() => {}) => {
  const sql = 'SELECT * FROM md_Model WHERE mdID = @mdId';

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
  */
  let request = _connector.queryRequest().setInput('mdId', _connector.TYPES.NVarChar, mdId);
  Q.nfcall(request.executeQuery, sql).then((resultSet) => {
    callback(null, resultSet[0]);
  }).fail((err) => {
    winston.error('===query model failed:', err);
    callback(err);
  });
};

module.exports.getBatchCategoryFeatures = (featureIds, callback) => {
  const request = _connector.queryRequest();

  const parameterizedSql = featureIds.map((featId, index) => {
    const parameterized = `featId_${index}`;
    request.setInput(parameterized, _connector.TYPES.NVarChar, code);
    return `@${parameterized}`;
  }).join(', ');

  const sql = 'SELECT feature.featID, feature.featName, feature.dataType, feature.codeGroup, feature.uiInputType ' +
    'FROM ft_Feature feature ' +
    `WHERE feature.featID IN (${parameterizedSql}) `;

  Q.nfcall(request.executeQuery, sql).then((result) => {
    callback(null, result);
  }).fail((err) => {
    winston.error('===model-service::getBatchCategoryFeatures(featureIds=%j) failed: ', featureIds, err);
    callback(err);
  });
};

module.exports.getBatchTargetInfoOfCategory = (mdId, batId, mdListCateg, callback) => {
  const sql = 'SELECT md.*, mdList.batListThold ' +
    'FROM md_Model md, md_ListMst mdList ' +
    'WHERE md.mdID = mdList.mdID AND md.batID = mdList.batID ' +
    'AND mdList.mdListCateg = @mdListCateg AND md.mdID = @mdId and md.batID = @batId';
  let request = _connector.queryRequest()
    .setInput('mdId', _connector.TYPES.NVarChar, mdId)
    .setInput('batId', _connector.TYPES.NVarChar, batId)
    .setInput('mdListCateg', _connector.TYPES.NVarChar, mdListCateg);

  Q.nfcall(request.executeQuery, sql).then(resultSet => {
    winston.info(`===getBatchTargetInfoOfCategory: ${resultSet}`);
    callback(null, resultSet[0]);
  }).fail((err) => {
    winston.error('===getBatchTargetInfoOfCategory failed:', err);
    callback(err);
  });
};

module.exports.getBatchTargetSummaryOfCategory = (mdId, batId, category, callback) => {
  const sql =
    'SELECT model.*, batch.batName, batch.batDesc, batch.LastTime AS lastTimeBatch, master.batListThold, target.categCount ' +
    'FROM md_Model model, md_Batch batch, md_ListMst master, ' +
    '  (SELECT mdID, batID, mdListCateg, count(*) AS categCount ' +
    '   FROM md_ListDet ' +
    '   WHERE mdID = @mdId AND batID = @batId AND mdListCateg = @mdListCateg' +
    '   GROUP BY mdID, batID, mdListCateg) target ' +
    'WHERE batch.mdID = target.mdID AND batch.batID = target.batID AND batch.mdID = model.mdID ' +
    'AND master.mdID = target.mdID AND master.batID = target.batID AND master.mdListCateg = target.mdListCateg';
  let request = _connector.queryRequest()
    .setInput('mdId', _connector.TYPES.NVarChar, mdId)
    .setInput('batId', _connector.TYPES.NVarChar, batId)
    .setInput('mdListCateg', _connector.TYPES.NVarChar, category);

  Q.nfcall(request.executeQuery, sql).then((resultSet) => {
    callback(null, resultSet[0]);
  }).fail((err) => {
    winston.error('===getBatchTargetSummaryOfCategory failed:', err);
    callback(err);
  });
};