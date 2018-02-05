const _ = require('lodash');
const Q = require('q');
const winston = require('winston');
const _connector = require('../utils/sql-query-util');
const modelService = require('./model-service');

module.exports.getCriteriaFeatures = (setId, callback) => {
  const sql = 'SELECT feature.featID ' +
    'FROM cd_TargetFeat t_feat, cd_Feature feature ' +
    'WHERE t_feat.setID = @setId AND t_feat.featID = feature.featID';

  let request = _connector.queryRequest().setInput('setId', _connector.TYPES.NVarChar, setId);
  Q.nfcall(request.executeQuery, sql).then(results => {
    let featureIds = _.map(results, 'featID');
    return Q.nfcall(modelService.getBatchCategoryFeatures, featureIds);
  }).then((result) => {
    callback(null, result);
  }).fail(err => {
    winston.error('===getCustomCriteriaFeatures failed:', err);
    callback(err);
  });
};

module.exports.getCriteriaFeatureTree = (treeId, callback) => {
  const sql = 'SELECT nodeID, parentID, treeLevel, nodeName ' +
    'FROM cd_CategTree ' +
    'WHERE treeID = @treeId ' +
    'ORDER BY treeLevel, treeSeq';
  Q.nfcall(_connector
    .queryRequest()
    .setInput('treeId', _connector.TYPES.NVarChar, treeId)
    .executeQuery, sql).then((result) => {
    callback(null, result);
  }).fail((err) => {
    winston.error('===integrated-analysis-service::getCriteriaFeatureTree(treeId=%s) failed: %j',
      treeId, err);
    callback(err);
  });
};

module.exports.getFeatureSets = (transSetId, callback) => {
  const sql = 'SELECT transFeatSetID, transFeatSetName ' +
    'FROM cd_TransFeatSet ' +
    'WHERE transSetID = @transSetID';

  Q.nfcall(_connector
    .queryRequest()
    .setInput('transSetID', _connector.TYPES.NVarChar, transSetId)
    .executeQuery, sql).then((result) => {
    callback(null, result);
  }).fail((err) => {
    winston.error('===integrated-analysis-service::getFeatureSets(transSetId=%s) failed: %j', transSetId, err);
    callback(err);
  });
};

module.exports.getDownloadFeatures = (setId, callback) => {
  const sql = 'SELECT feature.featID, feature.featName ' +
    'FROM cd_DnldFeat d_feat, cd_Feature feature ' +
    'WHERE d_feat.setID = @setId AND d_feat.featID = feature.featID';

  let request = _connector.queryRequest().setInput('setId', _connector.TYPES.NVarChar, setId);
  Q.nfcall(request.executeQuery, sql).then(results => {
    callback(null, results);
  }).fail(err => {
    winston.error('===getDownloadFeatures failed:', err);
    callback(err);
  });
};

module.exports.getRelativeFeatureSets = (transSetId, callback) => {
  const sql = 'SELECT transFeatSetID AS setId, transFeatSetName AS setName ' +
    'FROM cd_TransFeatSet t_set ' +
    'WHERE transSetID = @transSetId';

  let request = _connector.queryRequest().setInput('transSetId', _connector.TYPES.NVarChar, transSetId);
  Q.nfcall(request.executeQuery, sql).then(results => {
    callback(null, results);
  }).fail(err => {
    winston.error('===getRelativeFeatureSets failed:', err);
    callback(err);
  });
};