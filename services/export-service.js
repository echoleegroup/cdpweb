'use strict'

const _ = require('lodash');
const Q = require('q');
const winston = require('winston');
const _connector = require('../utils/sql-query-util');

module.exports.getDownloadFeaturesOfSet = (setId, callback) => {
  const sql = 'SELECT feat.featID, feat.featName, feat.featNameAbbr, dwn.customized ' +
    'FROM cu_DnldFeat dwn, ft_feature feat ' +
    'WHERE setID = @setId AND dwn.customized = @customized AND dwn.featID = feat.featID AND isDel != @isDel ' +
    'ORDER BY seqNO';

  Q.nfcall(_connector
    .queryRequest()
    .setInput('setId', _connector.TYPES.NVarChar, setId)
    .setInput('customized', _connector.TYPES.NVarChar, 'N')
    .setInput('isDel', _connector.TYPES.NVarChar, 'Y')
    .executeQuery, sql).then((resultSet) => {
    callback(null, resultSet);
  }).fail((err) => {
    winston.error('===getDownloadFeaturesOfSet failed:', err);
    callback(err);
  });
};