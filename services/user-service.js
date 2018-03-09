'use strict'

const Q = require('q');
const winston = require('winston');
const _connector = require('../utils/sql-query-util');

module.exports.getUserUgrpMenu = (userId, callback=()=>{}) => {
  const sql = 'SELECT syuw.userId,syuw.ugrpId ,sym.menuCode,syu.isRead,syu.isEdit,syu.isDownload ' +
      'FROM sy_userWithUgrp syuw ' +
      'LEFT JOIN sy_ugrpcode syu on syu.ugrpId = syuw.ugrpId ' +
      'LEFT JOIN sy_menu sym on sym.menuId = syu.menuId and sym.parentId is not null ' +
      'WHERE userId = @userId order by sym.menuId ASC';
  let request = _connector.queryRequest().setInput('userId', _connector.TYPES.NVarChar, userId);
  Q.nfcall(request.executeQuery, sql).then((resultSet) => {
    callback(null, resultSet);
  }).fail(err => {
    winston.error('====[getUserUgrpMenu] get user group menu failed: : ', err);
    callback(err);
  });
};

module.exports.getUserInfo = (userId, callback) => {
  const sql = 'SELECT userName, email, ugrpName, telephone ' +
    'FROM sy_infouser ' +
    'WHERE userId = @userId AND isstop = @isStop';

  let request = _connector.queryRequest()
    .setInput('userId', _connector.TYPES.NVarChar, userId)
    .setInput('isStop', _connector.TYPES.NVarChar, 'N');

  Q.nfcall(request.executeQuery, sql).then(result => {
    callback(null, result[0]);
  }).fail(err => {
    callback(e);
  });
};