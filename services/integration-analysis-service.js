// const request = require('request');
const moment = require('moment');
const Q = require('q');
const winston = require('winston');
const _connector = require('../utils/sql-query-util');
const cassandra_client = require('../utils/cassandra-client');
// const appConfig = require("../app-config");

// module.exports.getFeatureById = (featureId, callback) => {
//   const sql = 'SELECT feature.featID, feature.featName, feature.dataType, feature.chartType, ' +
//     'feature.codeGroup, feature.featNameExt, feature.featDesc, ct.codeLabel AS dataSourceLabel ' +
//     'FROM cd_Feature feature ' +
//     'LEFT JOIN ft_CodeTable ct ON ct.codeGroup = @codeGroup AND ct.codeValue = feature.dataSource ' +
//     `WHERE feature.featID = @featureId AND (isDel != @isDel OR isDel is NULL)`;
//
//   let request = _connector
//     .queryRequest()
//     .setInput('featureId', _connector.TYPES.NVarChar, featureId)
//     .setInput('codeGroup', _connector.TYPES.NVarChar, 'ftdatasouce')
//     .setInput('isDel', _connector.TYPES.NVarChar, 'Y');
//
//   Q.nfcall(request.executeQuery, sql)
//     .then(result => callback(null, result[0]))
//     .fail(err => {callback(err)});
// };
//
// module.exports.getFeaturesById = (idList, callback) => {
//   const sql = 'SELECT feature.featID, feature.featName, feature.dataType, feature.chartType, feature.codeGroup ' +
//     'FROM cd_Feature feature ' +
//     `WHERE feature.featID in ('${idList.join(`','`)}') AND (isDel != @isDel OR isDel is NULL)`;
//
//   let request = _connector
//     .queryRequest()
//     .setInput('isDel', _connector.TYPES.NVarChar, 'Y');
//   Q.nfcall(request.executeQuery, sql)
//     .then(result => callback(null, result))
//     .fail(err => {callback(err)});
// };

module.exports.getCriteriaFeaturesOfSet = (setId, callback) => {
  const sql = 'SELECT feature.featID, feature.featName, feature.dataType, ' +
    'feature.chartType, feature.minPeriod, feature.codeGroup, feature.uiInputType ' +
    'FROM cd_TargetFeat t_feat, cd_Feature feature ' +
    'WHERE t_feat.setID = @setId AND t_feat.featID = feature.featID AND (isDel != @isDel OR isDel is NULL)';

  let request = _connector
    .queryRequest()
    .setInput('setId', _connector.TYPES.NVarChar, setId)
    .setInput('isDel', _connector.TYPES.NVarChar, 'Y');
  Q.nfcall(request.executeQuery, sql).then(result => {
    callback(null, result);
  }).fail(err => {
    winston.error('===getCustomCriteriaFeatures failed:', err);
    callback(err);
  });
};

module.exports.getCriteriaFeatureTree = (treeId, callback) => {
  const sql = 'SELECT nodeID, parentID, treeLevel, nodeName, isDummy ' +
    'FROM cd_CategTree ' +
    'WHERE treeID = @treeId ' +
    'ORDER BY treeLevel, treeSeq';
  Q.nfcall(_connector
    .queryRequest()
    .setInput('treeId', _connector.TYPES.NVarChar, treeId)
    .executeQuery, sql).then((result) => {
    callback(null, result);
  }).fail((err) => {
    winston.error('===integrated-analysis-service::getCriteriaFeatureTree(treeId=%s) failed: ',
      treeId, err);
    callback(err);
  });
};

module.exports.getFeatureSets = (transSetId, callback) => {
  const sql = 'SELECT transFeatSetID AS nodeID, transFeatSetName AS nodeName, transLogCateg AS nodeCateg ' +
    'FROM cd_TransFeatSet ' +
    'WHERE transSetID = @transSetID';

  Q.nfcall(_connector
    .queryRequest()
    .setInput('transSetID', _connector.TYPES.NVarChar, transSetId)
    .executeQuery, sql).then((result) => {
    callback(null, result);
  }).fail((err) => {
    winston.error('===integrated-analysis-service::getFeatureSets(transSetId=%s) failed: ', transSetId, err);
    callback(err);
  });
};

module.exports.getFeatureSet = (transSetId, setId, callback) => {
  const sql = 'SELECT transFeatSetID, transFeatSetName, periodCriteriaFeatID, updTime, updUser ' +
    'FROM cd_TransFeatSet ' +
    'WHERE transSetID = @transSetID AND transFeatSetID = @transFeatSetID';

  Q.nfcall(_connector
    .queryRequest()
    .setInput('transSetID', _connector.TYPES.NVarChar, transSetId)
    .setInput('transFeatSetID', _connector.TYPES.NVarChar, setId)
    .executeQuery, sql).then((result) => {
    callback(null, result[0]);
  }).fail((err) => {
    winston.error(`===integrated-analysis-service::getFeatureSet(transSetId=${transSetId}, setId=${setId}) failed: `, err);
    callback(err);
  });
};

module.exports.getDownloadFeaturesOfSet = (setId, callback) => {
  const sql = 'SELECT feature.featID, feature.featName ' +
    'FROM cd_DnldFeat d_feat, cd_Feature feature ' +
    'WHERE d_feat.setID = @setId AND d_feat.featID = feature.featID AND (isDel != @isDel OR isDel is NULL)';

  let request = _connector
    .queryRequest()
    .setInput('setId', _connector.TYPES.NVarChar, setId)
    .setInput('isDel', _connector.TYPES.NVarChar, 'Y');

  Q.nfcall(request.executeQuery, sql).then(results => {
    callback(null, results);
  }).fail(err => {
    winston.error('===getDownloadFeaturesOfSet failed:', err);
    callback(err);
  });
};

module.exports.getDownloadFeaturesByIds = (featIds, callback) => {
  const sql = 'SELECT feature.featID, feature.featName, feature.featNameAbbr, feature.codeGroup ' +
    'FROM cd_DnldFeat d_feat, cd_Feature feature ' +
    `WHERE d_feat.featID in ('${featIds.join(`','`)}') ` +
    'AND d_feat.featID = feature.featID AND (isDel != @isDel OR isDel is NULL) ' +
    'ORDER BY d_feat.seqNO ';

  let request = _connector
    .queryRequest()
    .setInput('isDel', _connector.TYPES.NVarChar, 'Y');

  Q.nfcall(request.executeQuery, sql).then(results => {
    callback(null, results);
  }).fail(err => {
    winston.error('===getDownloadFeaturesOfSet failed:', err);
    callback(err);
  });
};

module.exports.filterTagActiveSet = (keyword, callback) => {
  const sql = 'SELECT DISTINCT tagLabel as nodeID, tagLabel as nodeName ' +
    'FROM cu_OuterListTag ' +
    `WHERE tagLabel like '%' + @keyword + '%' AND (isDel != @isDel or isDel is NULL)`;

  let request = _connector
    .queryRequest()
    .setInput('keyword', _connector.TYPES.NVarChar, keyword)
    .setInput('isDel', _connector.TYPES.NVarChar, 'Y');

  Q.nfcall(request.executeQuery, sql).then(resSet => {
    callback(null, resSet);
  }).fail(err => {
    callback(err);
  });
};

module.exports.filterTagQtnSet = (keyword, callback) => {
  const sql = 'SELECT DISTINCT tagLabel as nodeID, tagLabel as nodeName ' +
    'FROM cu_NCBSTag ' +
    `WHERE tagLabel like '%' + @keyword + '%' AND (isDel != @isDel or isDel is NULL)`;

  let request = _connector
    .queryRequest()
    .setInput('keyword', _connector.TYPES.NVarChar, keyword)
    .setInput('isDel', _connector.TYPES.NVarChar, 'Y');

  Q.nfcall(request.executeQuery, sql).then(resSet => {
    callback(null, resSet);
  }).fail(err => {
    callback(err);
  });
};

module.exports.filterTagOwnMediaSet = (keyword, callback) => {
  const sql = `SELECT tagLabel as nodeID, tagLabel as nodeName FROM dm_EvtpgTag where tagLabel like '%' + @keyword + '%' AND (isDel != @isDel or isDel is NULL) ` +
    'UNION ' +
    `SELECT tagLabel as nodeID, tagLabel as nodeName FROM dm_GenpgTag where tagLabel like '%' + @keyword + '%' AND (isDel != @isDel or isDel is NULL) ` +
    'UNION ' +
    `SELECT tagLabel as nodeID, tagLabel as nodeName FROM dm_TrackpgTag where tagLabel like '%' + @keyword + '%' AND (isDel != @isDel or isDel is NULL) ` +
    'UNION ' +
    `SELECT tagLabel as nodeID, tagLabel as nodeName FROM dm_APPpgTag where tagLabel like '%' + @keyword + '%' AND (isDel != @isDel or isDel is NULL) `;

  let request = _connector
    .queryRequest()
    .setInput('keyword', _connector.TYPES.NVarChar, keyword)
    .setInput('isDel', _connector.TYPES.NVarChar, 'Y');

  Q.nfcall(request.executeQuery, sql).then(resSet => {
    callback(null, resSet);
  }).fail(err => {
    callback(err);
  });
};

module.exports.filterTagEInterestSet = (keyword, callback) => {
  const sql = 'SELECT DISTINCT tagLabel as nodeID, tagLabel as nodeName ' +
    'FROM dm_ElandTag ' +
    `WHERE elandCategID = @elandCategID AND tagLabel like '%' + @keyword + '%' AND (isDel != @isDel or isDel is NULL)`;

  let request = _connector
    .queryRequest()
    .setInput('elandCategID', _connector.TYPES.NVarChar, 'INTEREST')
    .setInput('keyword', _connector.TYPES.NVarChar, keyword)
    .setInput('isDel', _connector.TYPES.NVarChar, 'Y');

  Q.nfcall(request.executeQuery, sql).then(resSet => {
    callback(null, resSet);
  }).fail(err => {
    callback(err);
  });
};

module.exports.filterTagEIntentSet = (keyword, callback) => {
  const sql = 'SELECT DISTINCT tagLabel as nodeID, tagLabel as nodeName ' +
    'FROM dm_ElandTag ' +
    `WHERE elandCategID = @elandCategID AND tagLabel like '%' + @keyword + '%' AND (isDel != @isDel or isDel is NULL)`;

  let request = _connector
    .queryRequest()
    .setInput('elandCategID', _connector.TYPES.NVarChar, 'INTENT')
    .setInput('keyword', _connector.TYPES.NVarChar, keyword)
    .setInput('isDel', _connector.TYPES.NVarChar, 'Y');

  Q.nfcall(request.executeQuery, sql).then(resSet => {
    callback(null, resSet);
  }).fail(err => {
    callback(err);
  });
};

module.exports.filterTagOuterMediaSet = (keyword, callback) => {
  const sql = 'SELECT DISTINCT tagLabel as nodeID, tagLabel as nodeName ' +
    'FROM dm_EvtadTag ' +
    `WHERE tagLabel like '%' + @keyword + '%' AND (isDel != @isDel or isDel is NULL)`;

  let request = _connector
    .queryRequest()
    .setInput('keyword', _connector.TYPES.NVarChar, keyword)
    .setInput('isDel', _connector.TYPES.NVarChar, 'Y');

  Q.nfcall(request.executeQuery, sql).then(resSet => {
    callback(null, resSet);
  }).fail(err => {
    callback(err);
  });
};

module.exports.getTrailPeriodLogGenpgFeatures = (callback) => {
  const sql = 'SELECT genCategID AS nodeID, categName AS nodeName ' +
    'FROM dm_GenpgCateg ' +
    'WHERE isDel != @isDel OR isDel is NULL';

  let request = _connector
    .queryRequest()
    .setInput('isDel', _connector.TYPES.NVarChar, 'Y');

  Q.nfcall(request.executeQuery, sql).then(resSet => {
    callback(null, resSet);
  }).fail(err => {
    callback(err);
  });
};

module.exports.getTrailPeriodLogAPPpgFeatures = (callback) => {
  const sql = 'SELECT apppgID AS nodeID, apppgTitle AS nodeName ' +
    'FROM dm_APPpgMst ' +
    'WHERE isDel != @isDel OR isDel is NULL';

  let request = _connector
    .queryRequest()
    .setInput('isDel', _connector.TYPES.NVarChar, 'Y');

  Q.nfcall(request.executeQuery, sql).then(resSet => {
    callback(null, resSet);
  }).fail(err => {
    callback(err);
  });
};

module.exports.getTrailPeriodLogEDMReadFeatures = (keyword, periodStart, periodEnd, callback) => {
  // const keyspace = 'edm';
  const cql = 'SELECT id, subject, scheduledate ' +
    'FROM edm.reportlist ' +
    'WHERE scheduledatetrans >= :startDate ALLOW FILTERING; ';
  const params = {
    startDate: moment().startOf('day').add(-1, 'month').toDate()
  };

  Q(cassandra_client.execute(cql, params, {prepare: true})).then(result => {
    callback(null, result.rows);
  }).fail(err => {
    callback(err);
  });
};

module.exports.getTrailPeriodLogPushReadFeatures = (keyword, periodStart, periodEnd, callback) => {
  // const keyspace = 'jamzoo';
  const cql = 'SELECT pid, title, start_datetime ' +
    'FROM jamzoo.getpushhistory ' +
    'WHERE start_datetime >= :startDate ALLOW FILTERING;';
  const params = {
    startDate: moment().startOf('day').add(-1, 'month').toDate()
  };

  Q(cassandra_client.execute(cql, params, {prepare: true})).then(result => {
    callback(null, result.rows);
  }).fail(err => {
    callback(err);
  });
};