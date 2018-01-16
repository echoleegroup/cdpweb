'use strict'

const _ = require('lodash');
const Q = require('q');
const winston = require('winston');
const _connector = require('../utils/sql-query-util');

module.exports.getDownloadFeatures = (setId, callback) => {
  const sql = 'SELECT feat.featID, feat.featNameAbbr ' +
    'FROM cu_DnldConfig dwn, ft_feature feat ' +
    'WHERE setID = @setId AND dwn.featID = feat.featID ORDER BY seqNO';
  let params = {
    setID: {
      type: _connector.TYPES.NVarChar,
      value: setId
    }
  };
  Q.nfcall(_connector
    .queryRequest()
    .setInput('setID', _connector.TYPES.NVarChar, setId)
    .executeQuery, sql).then((resultSet) => {
    callback(null, resultSet);
  }).fail((err) => {
    winston.error('===getDownloadFeatures failed:', err);
    callback(err);
  });
};