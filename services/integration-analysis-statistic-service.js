const _ = require('lodash');
const Q = require('q');
const winston = require('winston');
const _connector = require('../utils/sql-query-util');

module.exports.getStatisticFeatureOfTask = (queryId, featureId, callback) => {
  const sql = 'select feature.featID, feature.featName, feature.codeGroup, sf.category ' +
    'FROM cu_IntegratedQueryStatistic sf, cd_Feature feature ' +
    'WHERE queryID = @queryId AND sf.featID = feature.featID AND sf.featID = @featureId';

  let request = _connector.queryRequest()
    .setInput('queryId', _connector.TYPES.NVarChar, queryId)
    .setInput('featureId', _connector.TYPES.NVarChar, featureId);

  Q.nfcall(request.executeQuery, sql).then(result => {
    callback(null, result[0]);
  }).fail(err => {
    winston.error(`===get statistic feature of task failed! (queryID=${queryId}, featureId=${featureId}): `, err);
    callback(err);
  });
};

module.exports.getStatisticFeaturesOfTask = (queryId, callback) => {
  const sql = 'select feature.featID, feature.featName, feature.dataType, feature.minPeriod, ' +
    'feature.chartType, feature.codeGroup, sf.category, sf.average, sf.median,' +
    'feature.featNameExt AS unit, feature.featDesc AS description, ' +
    'ct.codeLabel AS dataSourceLabel, sf.standardDeviation, sf.scaleUpperBound, ' +
    'sf.scaleLowerBound, sf.maxScale, sf.maxPeak, sf.maxProportion, ISNULL(chart.size, 0) AS chartSize ' +
    'FROM cu_IntegratedQueryStatistic sf, cd_Feature feature ' +
    'LEFT JOIN (' +
    '   SELECT COUNT(*) AS size, featID ' +
    '   FROM cu_IntegratedQueryStatisticChart' +
    '   WHERE queryID = @queryId GROUP BY featID ) chart ON feature.featID = chart.featID ' +
    'LEFT JOIN sy_CodeTable ct ON ct.codeGroup = @codeGroup AND ct.codeValue = feature.dataSource ' +
    'WHERE sf.queryID = @queryId AND sf.featID = feature.featID';

  let request = _connector.queryRequest()
    .setInput('queryId', _connector.TYPES.NVarChar, queryId)
    .setInput('codeGroup', _connector.TYPES.NVarChar, 'ftdatasource');

  Q.nfcall(request.executeQuery, sql).then(result => {
    callback(null, result);
  }).fail(err => {
    winston.error(`===get statistic of task failed! (queryID=${queryId}): `, err);
    callback(err);
  });
};

module.exports.deleteStatisticOfTask = (queryId, callback) => {
  const sql = 'DELETE FROM cu_IntegratedQueryStatistic WHERE queryID = @queryId';

  let request = _connector.queryRequest()
    .setInput('queryId', _connector.TYPES.NVarChar, queryId);

  Q.nfcall(request.executeUpdate, sql).then(result => {
    callback(null, {
      queryID: queryId
    });
  }).fail(err => {
    winston.error(`===delete statistic of task failed! (queryID=${queryId}: `, err);
    callback(err);
  });
};

module.exports.insertStatisticOfFeature = (
  queryId, featureId, category, average, median, standardDeviation,
  scaleUpperBound, scaleLowerBound, maxScale, maxPeak, maxProportion, callback) => {
  const sql = 'INSERT INTO cu_IntegratedQueryStatistic (' +
    'queryID, featID, category, average, median, standardDeviation, ' +
    'scaleUpperBound, scaleLowerBound, maxScale, maxPeak, maxProportion, crtTime) ' +
    'VALUES (' +
    '@queryId, @featureId, @category, @average, @median, @standardDeviation, ' +
    '@scaleUpperBound, @scaleLowerBound, @maxScale, @maxPeak, @maxProportion, @now)';

  let request = _connector.queryRequest()
    .setInput('queryId', _connector.TYPES.NVarChar, queryId)
    .setInput('featureId', _connector.TYPES.NVarChar, featureId)
    .setInput('category', _connector.TYPES.NVarChar, category)
    .setInput('average', _connector.TYPES.Float, average)
    .setInput('median', _connector.TYPES.Float, median)
    .setInput('standardDeviation', _connector.TYPES.NVarChar, standardDeviation)
    .setInput('scaleUpperBound', _connector.TYPES.NVarChar, scaleUpperBound)
    .setInput('scaleLowerBound', _connector.TYPES.NVarChar, scaleLowerBound)
    .setInput('maxScale', _connector.TYPES.NVarChar, maxScale)
    .setInput('maxPeak', _connector.TYPES.NVarChar, maxPeak)
    .setInput('maxProportion', _connector.TYPES.Float, maxProportion)
    .setInput('now', _connector.TYPES.DateTime, new Date());

  Q.nfcall(request.executeUpdate, sql).then(result => {
    callback(null, {
      queryID: queryId
    });
  }).fail(err => {
    winston.error(`===insert statistic of feature failed! (queryID=${queryId}, featureId=${featureId}: `, err);
    callback(err);
  });
};

module.exports.deleteStatisticChartOfFeature = (queryId, callback) => {
  const sql = 'DELETE FROM cu_IntegratedQueryStatisticChart WHERE queryID = @queryId';

  let request = _connector.queryRequest()
    .setInput('queryId', _connector.TYPES.NVarChar, queryId);

  Q.nfcall(request.executeUpdate, sql).then(result => {
    callback(null, {
      queryID: queryId
    });
  }).fail(err => {
    winston.error(`===delete statistic of task chart failed! (queryID=${queryId}: `, err);
    callback(err);
  });
};

module.exports.insertStatisticChartOfFeature = (queryId, featureId, scale, peak, proportion, seq, callback) => {
  const sql = 'INSERT INTO cu_IntegratedQueryStatisticChart (' +
    'queryID, featID, scale, peak, proportion, seq, crtTime) ' +
    'VALUES (@queryId, @featureId, @scale, @peak, @proportion, @seq, @now)';

  let request = _connector.queryRequest()
    .setInput('queryId', _connector.TYPES.NVarChar, queryId)
    .setInput('featureId', _connector.TYPES.NVarChar, featureId)
    .setInput('scale', _connector.TYPES.NVarChar, scale)
    .setInput('peak', _connector.TYPES.NVarChar, peak)
    .setInput('proportion', _connector.TYPES.Float, proportion)
    .setInput('seq', _connector.TYPES.Int, seq)
    .setInput('now', _connector.TYPES.DateTime, new Date());

  Q.nfcall(request.executeUpdate, sql).then(result => {
    callback(null, {
      queryID: queryId
    });
  }).fail(err => {
    winston.error(`===insert statistic chart data of feature failed! (queryID=${queryId}, featureId=${featureId}: `,
      err);
    callback(err);
  });
};

module.exports.getStatisticChartOfFeature = (queryId, featureId, callback) => {
  const sql = 'SELECT * FROM cu_IntegratedQueryStatisticChart ' +
    'WHERE queryID = @queryId AND featID = @featId ' +
    'ORDER BY seq';

  let request = _connector.queryRequest()
    .setInput('queryId', _connector.TYPES.NVarChar, queryId)
    .setInput('featId', _connector.TYPES.NVarChar, featureId);

  Q.nfcall(request.executeQuery, sql).then(result => {
    callback(null, result);
  }).fail(err => {
    winston.error(`===insert statistic chart data of feature failed! (queryID=${queryId}, featureId=${featureId}: `,
      err);
    callback(err);
  });
};