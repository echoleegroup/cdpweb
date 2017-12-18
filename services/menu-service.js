'user strict'

const Q = require('q');
const mssql = require('mssql');
const winston = require('winston');
const _connector = require('../utils/sql-query-util');

module.exports.getMenuTree = (callback=() => {}) => {
  let sql = 'SELECT sm.menuCode,sm.parentId,sm.menuName,' +
      'sm.modifyDate,sm.modifyUser,sm.url, sm.sticky,' +
      'pym.menuName premenuName, pym.menuCode preMenuCode, pym.sticky preSticky ' +
      'FROM sy_menu sm ' +
      'LEFT JOIN sy_menu pym on sm.parentId = pym.menuId ' +
      'WHERE sm.parentId is not null';
  Q.nfcall(_connector.execSqlByParams, sql, {}).then((resultSet) => {
    callback(null, resultSet);
  }).fail(err => {
    winston.error('====[getMenuTree] get all menu failed: ', err);
    callback(err);
  });
};