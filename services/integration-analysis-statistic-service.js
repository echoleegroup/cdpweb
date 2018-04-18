const _ = require('lodash');
const Q = require('q');
const shortid = require('shortid');
const winston = require('winston');
const _connector = require('../utils/sql-query-util');

module.exports.insertStatisticOfFeature = (
  queryId, featureId, category, average, median, standardDeviation, rangeUpperBound, rangeLowerBound, callback) => {
  const sql = 'INSERT INTO cu_IntegratedQueryStatistic (' +
    'queryID, featID, category, average, median, standardDeviation, rangeUpperBound, rangeLowerBound, crtTime) ' +
    'VALUES (' +
    '@queryId, @featureId, @category, @average, @median, @standardDeviation, @rangeUpperBound, rangeLowerBound, @now)';

  let request = _connector.queryRequest()
    .setInput('queryId', _connector.TYPES.NVarChar, queryId)
    .setInput('featureId', _connector.TYPES.NVarChar, featureId)
    .setInput('category', _connector.TYPES.NVarChar, category)
    .setInput('average', _connector.TYPES.Float, average)
    .setInput('median', _connector.TYPES.Float, median)
    .setInput('standardDeviation', _connector.TYPES.Float, standardDeviation)
    .setInput('rangeUpperBound', _connector.TYPES.NVarChar, rangeUpperBound)
    .setInput('rangeLowerBound', _connector.TYPES.NVarChar, rangeLowerBound)
    .setInput('now', _connector.TYPES.DateTime, new Date());

  Q.nfcall(request.executeQuery, sql).then(result => {
    callback(null, {
      queryID: queryId
    });
  }).fail(err => {
    winston.error(`===insert statistic of feature failed! (queryID=${queryId}, featureId=${featureId}: `, err);
    callback(err);
  });
};

module.exports.insertStatisticChartOfFeature = (queryId, featureId, scale, pole, proportion, seq, callback) => {
  const sql = 'INSERT INTO cu_IntegratedQueryStatisticChart (' +
    'queryID, featID, scale, pole, proportion, seq, crtTime) ' +
    'VALUES (@queryId, @featureId, @scale, @pole, @proportion, @seq, @now)';

  let request = _connector.queryRequest()
    .setInput('queryId', _connector.TYPES.NVarChar, queryId)
    .setInput('featureId', _connector.TYPES.NVarChar, featureId)
    .setInput('scale', _connector.TYPES.NVarChar, scale)
    .setInput('pole', _connector.TYPES.NVarChar, pole)
    .setInput('proportion', _connector.TYPES.Float, proportion)
    .setInput('seq', _connector.TYPES.Int, seq)
    .setInput('now', _connector.TYPES.DateTime, new Date());

  Q.nfcall(request.executeQuery, sql).then(result => {
    callback(null, {
      queryID: queryId
    });
  }).fail(err => {
    winston.error(`===insert statistic chart data of feature failed! (queryID=${queryId}, featureId=${featureId}: `,
      err);
    callback(err);
  });
};