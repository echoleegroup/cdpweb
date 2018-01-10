const Q = require('q');
const winston = require('winston');
const _connector = require('../utils/sql-query-util');
const test_data = require('../client/test/preferred-criteria-test');

const getCriteriaAllFeatureId = (mdId, batId, mdFeatCateg, setId, callback) => {
  const sqlFetchFeatureId = 'SELECT featID FROM cu_CustomFeat WHERE setID = @setId ' +
    'UNION ' +
    'SELECT featID FROM md_FeatDet WHERE mdFeatCateg = @mdFeatCateg AND mdID = @mdId AND batID = @batId';
  let params = {
    setId: {
      type: _connector.TYPES.NVarChar,
      value: setId
    },
    mdFeatCateg: {
      type: _connector.TYPES.NVarChar,
      value: mdFeatCateg
    },
    mdId: {
      type: _connector.TYPES.NVarChar,
      value: mdId
    },
    batId: {
      type: _connector.TYPES.NVarChar,
      value: batId
    }
  };

  Q.nfcall(_connector.execSqlByParams, sqlFetchFeatureId, params).then((result) => {
    callback(null, result);
  }).fail((err) => {
    callback(err);
  });
};

module.exports.getModelBatchCategWithCustomFeatures = (mdId, batId, category, setId, callback) => {
  Q.nfcall(getCriteriaAllFeatureId, mdId, batId, category, setId).then(featureIds => {
    const sql = 'SELECT feature.featID, feature.featName, feature.dataType, feature.codeGroup ' +
      'FROM ft_Feature feature ' +
      'WHERE feature.featID in (@features) AND feature.isDel is not NULL';
    let params = {
      features: {
        type: _connector.TYPES.NVarChar,
        value: featureIds
      }
    };

    return Q.nfcall(_connector.execSqlByParams, sql, params).then((result) => {
      callback(null, result);
    });
  }).fail((err) => {
    winston.error('===criteria-service::' +
      'getModelBatchCategWithCustomFeatures(mdId=%s, batId=%s, category=%s, setID=%s) failed: %j',
      mdId, batId,category, setId, err);
    callback(err);
  });
};

module.exports.getFieldFoldingTree = (treeId, callback) => {
  const sql = 'SELECT nodeID, parentID, treeLevel, nodeName ' +
    'FROM ft_CategTree ' +
    'WHERE treeID = @treeId ' +
    'ORDER BY treeLevel, treeSeq';
  let params = {
    treeId: {
      type: _connector.TYPES.NVarChar,
      value: treeId
    }
  };

  Q.nfcall(_connector.execSqlByParams, sql, params).then((result) => {
    callback(null, result);
  }).fail((err) => {
    winston.error('===criteria-service::' +
      'getFieldFoldingTree(treeId=%s) failed: %j',
      treeId, err);
    callback(err);
  });
};

module.exports.getModelBatchCategFeature = (mdId, batId, category, callback) => {
  const sql = 'SELECT feature.featID, feature.featName, feature.dataType, feature.codeGroup ' +
    'FROM md_FeatDet det, ft_Feature feature ' +
    'WHERE det.mdID = @mdId AND det.batID = @batId AND det.mdFeatCateg = @category ' +
    'AND det.featID = feature.featID AND feature.isDel is not NULL';

  const params = {
    mdId: {
      type: _connector.TYPES.NVarChar,
      value: mdId
    },
    batId: {
      type: _connector.TYPES.NVarChar,
      value: batId
    },
    category: {
      type: _connector.TYPES.NVarChar,
      value: category
    }
  };

  Q.nfcall(_connector.execSqlByParams, sql, params).then((result) => {
    callback(null, result);
  }).fail((err) => {
    winston.error('===criteria-service::' +
      'getModelBatchCategFeature(mdId=%s, batId=%s, category=%s) failed: %j',
      mdId, batId,category, err);
    callback(err);
  });
};

module.exports.getCriteriaHistoryList = (callback) => {};
module.exports.getCriteriaHistory = (id, callback) => {
  callback(null, test_data.criteria[id]);
};