'use strict'

const Q = require('q');
const winston = require('winston');
const _connector = require('../utils/sql-query-util');

module.exports.getMenuTree = (callback=() => {}) => {
  let sql = 'SELECT sm.menuCode, sm.parentId, sm.menuName,' +
    'sm.modifyDate, sm.modifyUser, sm.url, sm.sticky,sm.homeFlag,sm.icon,sm.homeCotnet,' +
    'pym.menuName premenuName, pym.menuCode preMenuCode, pym.sticky preSticky ' +
    'FROM sy_menu sm ' +
    'LEFT JOIN sy_menu pym ON sm.parentId = pym.menuId ' +
    'WHERE sm.parentId IS NOT NULL ' +
    'ORDER BY pym.seq, sm.seq';
  Q.nfcall(_connector.execSql, sql).then((resultSet) => {
    callback(null, resultSet);
  }).fail(err => {
    winston.error('====[getMenuTree] get all menu failed: ', err);
    callback(err);
  });
};