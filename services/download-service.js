'user strict'

const Q = require('q');
const winston = require('winston');
const _connector = require('../utils/sql-query-util');

module.exports.getFilePath = (listid, datasource, callback = () => { }) => {
  let sql = 'SELECT origName,uniqName ';
  if (datasource == 'NCBS')
    sql += 'FROM cu_NCBSMst WHERE ncbsID = ' + listid;
  else if (datasource == 'outdata')
    sql += 'FROM cu_OuterListMst WHERE outerListID =' + listid;
  winston.info(sql);
  Q.nfcall(_connector.execSqlByParams, sql, {}).then((resultSet) => {
    callback(null, resultSet[0]);
  }).fail(err => {
    winston.error('====[download] get  downloadvalue failed: ', err);
    callback(err);
  });
};