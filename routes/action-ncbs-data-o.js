"use strict";
const multer = require('multer');
const winston = require('winston');
const express = require('express');
const db = require("../utils/sql-server-connector").db;
const middleware = require("../middlewares/login-check");
const constants = require("../utils/constants");
const permission = constants.MENU_CODE;
const storage = constants.ASSERTS_FOLDER_PATH_ABSOLUTE;
const upload = multer({ dest: storage });
const _connector = require('../utils/sql-query-util');
const Q = require('q');
const moment = require('moment');
const XlsxStreamReader = require("xlsx-stream-reader");
const fs = require("fs");
module.exports = (app) => {
  winston.info('[NCBSDataRoute::create] Creating NCBSData route.');
  const router = express.Router();

  router.post('/NCBS/upload_act', [
    middleware.check(),
    middleware.checkEditPermission(permission.FEED_DATA_NCBS),
    upload.single('uploadingFile')
  ], function (req, res, next) {
    winston.info('/feeddata/NCBS/upload_act get file');
    const _ = require('lodash');
    const COLUMN_MAPPER = {
      car: { xlsx: 'realid', db: 'LICSNO' },
    };
    const indexToRowNumberOffset = 2;
    const client = req.body.client || '';
    const ncbsYear = req.body.ncbsYear || '';
    const ncbsQus = req.body.ncbsQus || '';
    const ncbsName = req.body.ncbsName || '';
    const ncbsSdt = req.body.ncbsSdt || '';
    const ncbsEdt = req.body.ncbsEdt || '';
    const ncbsDesc = req.body.ncbsDesc || '';
    const xlsxFile = req.file;
    let licsNoColumnIndex;
    let canvasIDindex;
    let q4_b_index;
    const dbKeyColumn = COLUMN_MAPPER["car"].db;
    const origName = xlsxFile.originalname;
    const uniqName = xlsxFile.filename;
    const messageBody = {
      success_num: 0,
      error_num: 0,
      total: 0,
      error_msg: []
    };
    let ncbsID;
    var workBookReader = new XlsxStreamReader();
    workBookReader.on('error', function (error) {
      throw (error);
    });
    workBookReader.on('worksheet', function (workSheetReader) {
      if (workSheetReader.id > 1) {
        // we only want first sheet
        workSheetReader.skip();
        return;
      }
      workSheetReader.on('row', function (row) {
        if (row.attributes.r == 1) {
          // do something with row 1 like save as column names
          licsNoColumnIndex = row.values.indexOf(COLUMN_MAPPER.car.xlsx);
          canvasIDindex = row.values.indexOf("CanvasID");
          q4_b_index = row.values.indexOf("q4_b");
          const initSql = 'INSERT INTO cu_NCBSMst(ncbsName,Client,ncbsYear,ncbsDesc,ncbsQus,origName,uniqName,ncbsSdt,ncbsEdt,ncbsStruc,crtTime,updTime,updUser,funcCatge) ' +
            'OUTPUT INSERTED.ncbsID ' +
            'VALUES(@ncbsName, @client, @ncbsYear, @ncbsDesc,@ncbsQus, @origName ,@uniqName, @ncbsSdt ,@ncbsEdt ,@anstitle ,@crtTime,@updTime,@updUser ,@funcCatge)';
          Q.nfcall(_connector.queryRequest()
            .setInput('ncbsName', _connector.TYPES.NVarChar, ncbsName)
            .setInput('client', _connector.TYPES.NVarChar, client)
            .setInput('ncbsYear', _connector.TYPES.NVarChar, ncbsYear)
            .setInput('ncbsDesc', _connector.TYPES.NVarChar, ncbsDesc)
            .setInput('ncbsQus', _connector.TYPES.NVarChar, ncbsQus)
            .setInput('origName', _connector.TYPES.NVarChar, origName)
            .setInput('uniqName', _connector.TYPES.NVarChar, uniqName)
            .setInput('ncbsSdt', _connector.TYPES.DateTime, moment(ncbsSdt, 'YYYY/MM/DD').toDate())
            .setInput('ncbsEdt', _connector.TYPES.DateTime, moment(ncbsEdt, 'YYYY/MM/DD').toDate())
            .setInput('anstitle', _connector.TYPES.NVarChar, row.values.join(","))
            .setInput('crtTime', _connector.TYPES.DateTime, new Date())
            .setInput('updTime', _connector.TYPES.DateTime, new Date())
            .setInput('updUser', _connector.TYPES.NVarChar, req.user.userId)
            .setInput('funcCatge', _connector.TYPES.NVarChar, 'NCBS')
            .executeQuery, initSql)
            .then(resultSet => {
              ncbsID = resultSet[0].ncbsID;
            });
        } else {
          const validationSql = `SELECT ${dbKeyColumn} AS validation, LICSNO, CustID_u FROM cu_LicsnoIndex WHERE REPLACE(${dbKeyColumn},'-','') = '${row.values[licsNoColumnIndex].replace("-", "")}' `;
          Q.nfcall(_connector.queryRequest().executeQuery, validationSql).then(licsDataSet => {
            if (row.values[licsNoColumnIndex] == '') {
              messageBody.error_num += 1;
              messageBody.error_msg.push({
                line: workSheetReader.rowCount,
                message: `第${row.attributes.r}行${row.values[licsNoColumnIndex]}無資料`
              });
            }
            else if (licsDataSet == '') {
              messageBody.error_num += 1;
              messageBody.error_msg.push({
                line: workSheetReader.rowCount,
                message: `第${row.attributes.r}行${row.values[licsNoColumnIndex]}無效`
              });
            }
            else if (client == 'TOYOTA' && row.values[q4_b_index] != '5') {
              messageBody.error_num += 1;
              messageBody.error_msg.push({
                line: workSheetReader.rowCount,
                message: `第${row.attributes.r}行${row.values[licsNoColumnIndex]}無效`
              });
            }
            else {
              const insertSql = "INSERT INTO cu_NCBSDet (ncbsID,uLicsNO,uData,uCanvas)" +
                " VALUES( @ncbsID, @uLicsNO, @anscontent, @canvasID)";
              let request = _connector.queryRequest()
                .setInput('ncbsID', _connector.TYPES.Int, ncbsID)
                .setInput('uLicsNO', _connector.TYPES.NVarChar, row.values[licsNoColumnIndex])
                .setInput('anscontent', _connector.TYPES.NVarChar, row.values.join(","))
                .setInput('canvasID', _connector.TYPES.NVarChar, row.values[canvasIDindex]);
              Q.nfcall(request.executeUpdate, insertSql).then(resultSet => {
                // winston.info('after execute insert');
                messageBody.success_num += 1;
              }).fail(err => {
                winston.error('import ncbsDet list failed: ', err);
                messageBody.error_num += 1;
                messageBody.error_msg.push({
                  line: workSheetReader.rowCount,
                  message: `第${workSheetReader.rowCount}行匯入失敗`
                });
              });
            }
          }).fail(err => {
            winston.error(' error: ', err);
            next(require('boom').internal());
          });;
        }
      });
      workSheetReader.on('end', function () {
        messageBody.total = workSheetReader.rowCount;

      });
      // call process after registering handlers
      workSheetReader.process();
    });
    workBookReader.on('end', function () {
      let messages = _.map(_.sortBy(messageBody.error_msg, ['line']), 'message');
      let sql = "UPDATE cu_NCBSMst SET successNum = @successnum ,errorNum = @errornum ,errorMsg = @errormsg ,total = @total  where ncbsID = @ncbsID";
      let request = _connector.queryRequest()
        .setInput('successnum', _connector.TYPES.Int, messageBody.success_num)
        .setInput('errornum', _connector.TYPES.Int, messageBody.error_num)
        .setInput('total', _connector.TYPES.Int, messageBody.total - 1)
        .setInput('errorMsg', _connector.TYPES.NVarChar, messages.join('\n'))
        .setInput('ncbsID', _connector.TYPES.Int, ncbsID);
      Q.nfcall(request.executeUpdate, sql).then(resultSet => {
      }).fail(err => {
        winston.error('POST /feeddata/NCBS/upload_act error: ', err);
        next(require('boom').internal());
      });

      winston.info("NCBS upload done")
    });

    fs.createReadStream(xlsxFile.path).pipe(workBookReader);
    res.render('NCBSmessage', {
    });
  });
  
  router.get('/NCBS/edit', [middleware.check(), middleware.checkEditPermission(permission.FEED_DATA_NCBS)], function (req, res) {
    var ncbsID = req.query.ncbsID || '';
    var successnum = req.query.successnum || '';
    var errormsg = req.query.errormsg || '';
    var errornum = req.query.errornum || '';
    var total = req.query.total || '';
    var dispaly = req.query.dispaly || '';
    var datetime = req.query.datetime || '';
    var modelList = req.session.modelList;
    var navMenuList = req.session.navMenuList;
    var mgrMenuList = req.session.mgrMenuList;
    var atag;
    var mtag;
    var maininfo;
    var p1 = new Promise(function (resolve, reject) {
      db.query("SELECT cnm.ncbsName,cnm.Client,cnm.ncbsYear,cnm.ncbsDesc,cnm.ncbsQus,convert(varchar,cnm.ncbsSdt,111)ncbsSdt,convert(varchar,cnm.ncbsEdt,111)ncbsEdt,convert(varchar,cnm.updTime,120)updTime,cnm.updUser,(select count(*) FROM cu_NCBSDet cnb where cnb.ncbsID = cnm.ncbsID)NSBCcount,cnm.successNum,cnm.errorNum,cnm.errorMsg,cnm.total FROM cu_NCBSMst cnm where cnm.ncbsID = " + ncbsID, function (err, recordset) {
        if (err) {
          reject(err);
        }
        maininfo = recordset.recordset;
        resolve(maininfo);
      });
    });
    Promise.all([p1]).then(function (results) {
      res.render('NCBSDataEdit', {
        'user': req.user,
        'modelList': modelList,
        'navMenuList': navMenuList,
        'mgrMenuList': mgrMenuList,
        'maininfo': maininfo,
        'ncbsID': ncbsID,
        'dispaly': "block",
        'successnum': successnum,
        'errormsg': errormsg,
        'errornum': errornum,
        'total': total,
        'datetime': datetime
      });
    }).catch(function (e) {
      winston.error(e);
    });
  });

  router.get('/NCBS/upload', [middleware.check(), middleware.checkEditPermission(permission.FEED_DATA_NCBS)], function (req, res) {
    var modelList = req.session.modelList;
    var navMenuList = req.session.navMenuList;
    var mgrMenuList = req.session.mgrMenuList;
    let sql = "select ncbsDesc from cu_NCBSQus";
    let request = _connector.queryRequest();
    Q.nfcall(request.executeQuery, sql).then((resultSet) => {
      res.render('NCBSData_upload', {
        'user': req.user,
        'modelList': modelList,
        'navMenuList': navMenuList,
        'mgrMenuList': mgrMenuList,
        'ncbsDesc': resultSet
      });
    });
  });

  return router;
};
