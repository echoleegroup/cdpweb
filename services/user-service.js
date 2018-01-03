'use strict'

const Q = require('q');
const winston = require('winston');
const _connector = require('../utils/sql-query-util');

module.exports.getUserUgrpMenu = (userId, callback=()=>{}) => {
  let sql = 'SELECT syuw.userId,syuw.ugrpId ,sym.menuCode,syu.isRead,syu.isEdit,syu.isDownload ' +
      'FROM sy_userWithUgrp syuw ' +
      'LEFT JOIN sy_ugrpcode syu on syu.ugrpId = syuw.ugrpId ' +
      'LEFT JOIN sy_menu sym on sym.menuId = syu.menuId and sym.parentId is not null ' +
      'WHERE userId = @userId order by sym.menuId ASC';
  Q.nfcall(_connector.execSqlByParams, sql, {
    userId: {
      type: _connector.TYPES.NVarChar,
      value: userId
    }
  }).then((resultSet) => {
    callback(null, resultSet);
  }).fail(err => {
    winston.error('====[getUserUgrpMenu] get user group menu failed: : ', err);
    callback(err);
  });
};