const Q = require('q');
const _ = require('lodash');
const schedule = require('node-schedule');
const Sequelize = require('sequelize');
// const moment = require('moment');
const winston = require('winston');
const _connector = require('../utils/sql-query-util');
const sequelizeInst = require('../utils/sequelize-instance');

const preBuild = (tempTableName, callback) => {
  const sql =
    'BEGIN ' +
    '   WITH lics AS ( ' +
    '     SELECT LICSNO, CustID_u, NULLIF(CustID_l, CustID_u) AS CustID_l, Mobile_u, NULLIF(Mobile_l, Mobile_u) AS Mobile_l ' +
    '     FROM cu_LicsnoIndex ' +
    '     WHERE CustID_u IS NOT NULL OR CustID_l IS NOT NULL OR Mobile_u IS NOT NULL OR Mobile_l IS NOT NULL ' +
    '   ), ' +
    '   slod AS ( ' +
    '     SELECT DISTINCT CNTRNO, ORDDT, CUSTID, MOBILE ' +
    '     FROM cu_Slod ' +
    `     WHERE CNTSTS = '1' AND MOVSTS NOT IN ('6','7') AND (CUSTID IS NOT NULL OR MOBILE IS NOT NULL) ` +
    '   ), ' +
    '   lics_CustID AS ( ' +
    '     SELECT LICSNO, CustID_u AS CustID ' +
    '     FROM lics ' +
    '     WHERE CustID_u IS NOT NULL ' +
    '     UNION ALL ' +
    '     SELECT LICSNO, CustID_l AS CustID ' +
    '     FROM lics ' +
    '     WHERE CustID_l IS NOT NULL ' +
    '   ), ' +
    '   lics_Mobile AS ( ' +
    '     SELECT LICSNO, Mobile_u AS Mobile ' +
    '     FROM lics ' +
    '     WHERE Mobile_u IS NOT NULL ' +
    '     UNION ALL ' +
    '     SELECT LICSNO, Mobile_l AS Mobile ' +
    '     FROM lics ' +
    '     WHERE Mobile_l IS NOT NULL ' +
    '   ) ' +
    `   INSERT INTO ${tempTableName} (LICSNO, CNTRNO, ORDDT, crtTime) ` +
    '   SELECT LICSNO, CNTRNO, ORDDT, GETDATE() AS crtTime ' +
    '   FROM ( ' +
    '     SELECT LICSNO, CNTRNO, ORDDT, ROW_NUMBER() OVER (PARTITION BY LICSNO ORDER BY ORDDT DESC) AS SEQ ' +
    '     FROM ( ' +
    '       SELECT LICSNO, CNTRNO, ORDDT ' +
    '       FROM lics_CustID, slod ' +
    '       WHERE slod.CUSTID IS NOT NULL AND lics_CustID.CustID = slod.CUSTID ' +
    ' ' +
    '       UNION ' +
    ' ' +
    '       SELECT LICSNO, CNTRNO, ORDDT ' +
    '       FROM lics_Mobile, slod ' +
    '       WHERE slod.MOBILE IS NOT NULL AND lics_Mobile.Mobile = slod.MOBILE ' +
    '     ) LICS_SLOD ' +
    '   ) LICS_SLOD_SEQ ' +
    '   WHERE SEQ = 1 ' +
    'END';

  // const request = _connector.queryRequest().streamExecute(sql);
  // request.on('recordset', columns => {
  //   winston.info('preBuild License_Slod RecordSet: ', columns);
  // });
  //
  // request.on('row', row => {
  //   winston.info('preBuild License_Slod Row: ', row);
  // });
  //
  // request.on('error', err => {
  //   callback(err);
  // });
  //
  // request.on('done', result => {
  //   winston.info('preBuild License_Slod Done: ', result);
  //   callback(null, result);
  // })

  const request = _connector.queryRequest();
  Q.nfcall(request.executeUpdate, sql).then((res) => {
    callback(null, res);
  }).fail(err => {
    callback(err);
  });
};

module.exports = (app) => {
  const dailyTaskReportCron = {
    minute: 33,
    hour: 7
  };

  // schedule.scheduleJob(`0 * * * * *`, () => {
  schedule.scheduleJob(`${dailyTaskReportCron.minute} ${dailyTaskReportCron.hour} * * *`, () => {
    const tableName = 'cu_LicsLatestSlod';
    const tempTableName = `${tableName}_temp`;
    const queryInterface = sequelizeInst.getQueryInterface();
    Q(queryInterface.dropTable(tempTableName)).then(() => {
      return Q(queryInterface.createTable(tempTableName, {
        LICSNO: {
          type: Sequelize.STRING,
          primaryKey: true,
          allowNull: false
        },
        CNTRNO: {
          type: Sequelize.STRING,
          allowNull: false
        },
        ORDDT: {
          type: Sequelize.DATE,
          allowNull: false
        },
        crtTime: {
          type: Sequelize.DATE,
          allowNull: false
        }
      }, {
        timestamps: false,
      }));
    }).then(() => {
      winston.info(`table ${tempTableName} is created`);
      return Q.nfcall(preBuild, tempTableName);
    }).then(() => {
      winston.info(`data of table ${tempTableName} is build`);
      // drop
      return Q(queryInterface.dropTable(tableName));
    }).then(() => {
      winston.info(`table ${tableName} is dropped`);
      // rename
      return Q(queryInterface.renameTable(tempTableName, tableName));
    }).then(() => {
      winston.info(`table ${tempTableName} is renamed to ${tableName}`);
    }).fail(error => {
      winston.error(error);
      console.log(error);
    });
  });
};