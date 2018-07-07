"use strict";
const express = require('express');
const winston = require('winston');
const multer = require('multer');
const xlsx = require("node-xlsx");
const moment = require('moment');
const db = require("../utils/sql-server-connector").db;
const middleware = require("../middlewares/login-check");
const constants = require("../utils/constants");
const permission = constants.MENU_CODE;
const storage = constants.ASSERTS_FOLDER_PATH_ABSOLUTE;
const upload = multer({ dest: storage });;

function toUP(value) {
  if (value == undefined)
    return "";
  else
    return value.toUpperCase();
};
module.exports = (app) => {
  console.log('[talist_putuploadRoute::create] Creating talist_putupload route.');
  const router = express.Router();

  router.post('/ta/send/upload_act', [
    middleware.check(),
    middleware.checkEditPermission(permission.TA_DISPATCH_UPLOAD),
    upload.single('uploadingFile')
  ], function (req, res, next) {

    winston.info('/ta/send/upload_act get file');
    const _ = require('lodash');
    const COLUMN_MAPPER = {
      car: {xlsx: 'LISCNO', db: 'LICSNO'},
      uID: {xlsx: 'CustID', db: 'CustID_u'},
      VIN: {xlsx: 'VIN', db: 'VIN'}
    };
    const indexToRowNumberOffset = 2;
    const mdID = req.body.mdID || '';
    const batID = req.body.batID || '';
    const sentListCateg = req.body.sentListCateg || '';
    const sentListChannel = req.body.sentListChannel || '';
    const startDate = req.body.startDate || '';
    const sentListName = req.body.sentListName || '';
    const sentListDesc = req.body.sentListDesc || '';
    const optradio = req.body.optradio || '';

    const xlsxFile = req.file;
    const xlsxData = xlsx.parse(xlsxFile.path);
    const sheetName = xlsxData[0].name;
    const sheetData = xlsxData[0].data;
    const sheetHeader = sheetData.splice(0, 1)[0]; //sheetData is changed mutely.
    const xlsxKeyColumn = COLUMN_MAPPER[optradio].xlsx;
    const dbKeyColumn = COLUMN_MAPPER[optradio].db;
    const xlsxKeyColumnIndex = sheetHeader.indexOf(xlsxKeyColumn);
    const licsNoColumnIndex = sheetHeader.indexOf(COLUMN_MAPPER.car.xlsx);
    const custIdColumnIndex = sheetHeader.indexOf(COLUMN_MAPPER.uID.xlsx);
    const vinColumnIndex = sheetHeader.indexOf(COLUMN_MAPPER.VIN.xlsx);
    const messageBody = {
      success_num: 0,
      error_num: 0,
      total: sheetData.length,
      error_msg: []
    };
    const keys = sheetData.map(row => {
      return row[xlsxKeyColumnIndex] || '';
    });

    // winston.info('xlsxKeyColumn: ', xlsxKeyColumn);
    // winston.info('sheetHeader: ', sheetHeader);
    // winston.info('xlsxKeyColumnIndex: ', xlsxKeyColumnIndex);
    // winston.info('licsNoColumnIndex: ', licsNoColumnIndex);
    // winston.info('custIdColumnIndex: ', custIdColumnIndex);
    // winston.info('vinColumnIndex: ', vinColumnIndex);

    const Q = require('q');
    const _connector = require('../utils/sql-query-util');
    const request = _connector.queryRequest();
    const keyValueParameterized = _.pull(keys, '').map((key, index) => {
      const parameterized = `dbKeyValue_${index}`;
      request.setInput(parameterized, _connector.TYPES.NVarChar, key);
      return `@${parameterized}`;
    }).join(', ');

    const validationSql =
      `SELECT ${dbKeyColumn} AS validation, LICSNO, CustID_u ` +
      `FROM cu_LicsnoIndex ` +
      `WHERE ${dbKeyColumn} IN (${keyValueParameterized}) `;

    Q.nfcall(request.executeQuery, validationSql).then(licsDataSet => {
      // winston.info('get validation and licsno: ', licsDataSet);
      const validation = _.keyBy(licsDataSet, 'validation');

      const initSql = 'INSERT INTO cu_SentListMst(mdID, batID, sentListName, sentListCateg, ' +
          'sentListChannel, sentListDesc, sentListTime, updTime, updUser) ' +
          'OUTPUT INSERTED.sentListID ' +
          'VALUES(@mdID, @batID, @sentListName, @sentListCateg, @sentListChannel, ' +
          '@sentListDesc, @sentListTime, @updTime, @updUser)';

      return Q.nfcall(_connector.queryRequest()
        .setInput('mdID', _connector.TYPES.NVarChar, mdID)
        .setInput('batID', _connector.TYPES.NVarChar, batID)
        .setInput('sentListName', _connector.TYPES.NVarChar, sentListName)
        .setInput('sentListCateg', _connector.TYPES.NVarChar, sentListCateg)
        .setInput('sentListChannel', _connector.TYPES.NVarChar, sentListChannel)
        .setInput('sentListDesc', _connector.TYPES.NVarChar, sentListDesc)
        .setInput('sentListTime', _connector.TYPES.DateTime, moment(startDate, 'YYYY/MM/DD').toDate())
        .setInput('updTime', _connector.TYPES.DateTime, new Date())
        .setInput('updUser', _connector.TYPES.NVarChar, req.user.userId)
        .executeQuery, initSql)
        .then(resultSet => {

          const sentListID = resultSet[0].sentListID;

          winston.info('get init cu_SentListMst done, sentListID = ', sentListID);

          const insertSql = "INSERT INTO cu_SentListDet " +
            "(mdID, batID, sentListID, uCustID, uLicsNO, uVIN, rptKey, sentListScore) " +
            "VALUES" +
            "(@mdID, @batID, @sentListID, @CustID, @LICSNO, @VIN, @CustID_u, " +
            "(" +
            "SELECT max(mdListScore) " +
            "FROM md_ListDet mld " +
            "WHERE mld.mdID = @mdID AND mld.batID = @batID AND " +
            `mld.mdListKey1 = @refLICSNO AND mld.mdListCateg = 'tapop'` +
            ")" +
            ")";
          const partitions = 3;
          const chunkSize = Math.trunc(sheetData.length / partitions) + 1;
          const chunks = _.chunk(sheetData, chunkSize);
          const chunkProcesses = chunks.map((chunk, chunkIndex) => {
            const firstLineNumberOfChunk = chunkSize * chunkIndex + indexToRowNumberOffset;

            return _.reduce(chunk, (_promise, row, rowIndex) => {
              const keyValue = row[xlsxKeyColumnIndex];
              const licsData = validation[keyValue];
              const lineOfXlsx = rowIndex + firstLineNumberOfChunk;
              // winston.info('keyValue: ', keyValue);
              if (_.isEmpty(keyValue)) {
                messageBody.error_num += 1;
                messageBody.error_msg.push({
                  line: lineOfXlsx,
                  message: `第${lineOfXlsx}行(${row.join(',')})，${keyValue}無資料`
                });
                return _promise;
              } else if (!licsData) {
                messageBody.error_num += 1;
                messageBody.error_msg.push({
                  line: lineOfXlsx,
                  message: `第${lineOfXlsx}行(${row.join(',')})，${keyValue}無效`
                });
                return _promise;
              } else {
                return _promise.then(() => {
                  // winston.info('before execute insert')
                  return Q.nfcall(
                    _connector.queryRequest()
                      .setInput('mdID', _connector.TYPES.NVarChar, mdID)
                      .setInput('batID', _connector.TYPES.NVarChar, batID)
                      .setInput('sentListID', _connector.TYPES.Int, sentListID)
                      .setInput('CustID', _connector.TYPES.NVarChar, row[custIdColumnIndex])
                      .setInput('LICSNO', _connector.TYPES.NVarChar, row[licsNoColumnIndex])
                      .setInput('VIN', _connector.TYPES.NVarChar, row[vinColumnIndex])
                      .setInput('CustID_u', _connector.TYPES.NVarChar, licsData.CustID_u)
                      .setInput('refLICSNO', _connector.TYPES.NVarChar, licsData.LICSNO)
                      .executeUpdate, insertSql
                  ).then(resultSet => {
                    // winston.info('after execute insert');
                    messageBody.success_num += 1;
                    return null;
                  }).catch(err => {
                    winston.error('import dispatch list failed: ', err);
                    messageBody.error_num += 1;
                    messageBody.error_msg.push({
                      line: lineOfXlsx,
                      message: `第${lineOfXlsx}行(${row.join(',')})，匯入失敗`
                    });
                    return null;
                  });
                });
              }
            }, Q());
          });

          return Q.all(chunkProcesses).then(chunkResult => {
            return sentListID;
          });

        });

    }).then(sentListID => {
      winston.info('insert complete: sentListID = ', sentListID);
      let messages = _.map(_.sortBy(messageBody.error_msg, ['line']), 'message');
      res.redirect('/target/ta/send/edit?' +
        `successnum=${messageBody.success_num}` +
        `&errormsg=${messages.join('\n')}` +
        `&errornum=${messageBody.error_num}` +
        `&total=${messageBody.total}&dispaly=block` +
        `&datetime=${moment().format('YYYY/MM/DD HH:mm:ss')}` +
        `&sentListID=${sentListID}`);
    }).fail(err => {
      console.log(err);
      winston.error('POST /ta/send/upload_act error: ', err);
      next(require('boom').internal());
    });
  });

  router.get('/ta/send/upload/:mdID/:batID', [middleware.check(), middleware.checkEditPermission(permission.TA_DISPATCH_UPLOAD)], function (req, res) {
    var mdID = req.params.mdID || '';
    var batID = req.params.batID || '';
    var batchlist;
    var sentListCateg;
    var sentListChannel;
    var items;
    var p1 = new Promise(function (resolve, reject) {
      db.query("SELECT batID,batName FROM md_Batch where mdID ='" + mdID + "' and isClosed <> 'Y'  and isDel <> 'Y' order by updTime desc ", function (err, recordset) {
        if (err) {
          reject(err);
        }
        batchlist = recordset.recordset;
        resolve(batchlist);
      });
    });
    var p2 = new Promise(function (resolve, reject) {
      db.query("SELECT codeValue,codeLabel FROM sy_CodeTable where codeGroup = 'sentListCateg'", function (err, recordset) {
        if (err) {
          reject(err);
        }
        sentListCateg = recordset.recordset;
        resolve(sentListCateg);
      });
    });
    var p3 = new Promise(function (resolve, reject) {
      db.query("SELECT codeValue,codeLabel FROM sy_CodeTable where codeGroup = 'sentListChannel'", function (err, recordset) {
        if (err) {
          reject(err);
        }
        sentListChannel = recordset.recordset;
        resolve(sentListChannel);
      });
    });
    Promise.all([p1, p2, p3]).then(function (results) {
      db.query("SELECT mdName FROM md_Model where mdID = '" + mdID + "'", function (err, recordset) {
        var modelList = req.session.modelList;
        var navMenuList = req.session.navMenuList;
        var mgrMenuList = req.session.mgrMenuList;
        items = recordset.recordset;
        res.render('talist_putupload_add', {
          'user': req.user,
          'modelInfo': items[0],
          'funcName': '投放名單上傳',
          'modelList': modelList,
          'navMenuList': navMenuList,
          'mgrMenuList': mgrMenuList,
          'batchlist': batchlist,
          'sentListCateg': sentListCateg,
          'sentListChannel': sentListChannel,
          'mdID': mdID
        });
      });
    }).catch(function (e) {
      console.log(e);
    });
  });
  router.get('/ta/send/edit', [middleware.check(), middleware.checkEditPermission(permission.TA_DISPATCH_UPLOAD)], function (req, res) {
    var mdID = decodeURI(req.query.mdID) || '';
    var batID = decodeURI(req.query.batID) || '';
    var sentListID = decodeURI(req.query.sentListID) || '';
    var errormsg = decodeURI(req.query.errormsg) || '';
    var successnum = decodeURI(req.query.successnum) || '';
    var errornum = decodeURI(req.query.errornum) || '';
    var total = decodeURI(req.query.total) || '';
    var datetime = decodeURI(req.query.datetime) || '';
    var dispaly = decodeURI(req.query.dispaly) || '';
    var sentInfo;
    db.query("SELECT cslm.mdID,cslm.batID,mm.mdName,mb.batName,sc.codeLabel sentListCateg,sct.codeLabel sentListChannel,sentListID,sentListName,sentListDesc,convert(varchar ,cslm.sentListTime,120)sentListTime,convert(varchar ,cslm.updTime,111) updTime,cslm.updUser,(select count(*) from cu_SentListDet csld where  csld.sentListID = cslm.sentListID)count FROM cu_SentListMst cslm left join md_Model mm on cslm.mdID = mm.mdID left join md_Batch mb on mb.batID = cslm.batID left join sy_CodeTable sc on sc.codeGroup ='sentListCateg' and sc.codeValue = cslm.sentListCateg left join sy_CodeTable sct on sct.codeGroup ='sentListChannel' and sct.codeValue = cslm.sentListChannel where cslm.sentListID = " + sentListID, function (err, recordset) {
      var modelList = req.session.modelList;
      var navMenuList = req.session.navMenuList;
      var mgrMenuList = req.session.mgrMenuList;
      sentInfo = recordset.recordset;
      res.render('talist_putupload_Edit', {
        'user': req.user,
        'sentInfo': sentInfo,
        'funcName': '投放名單上傳',
        'modelList': modelList,
        'navMenuList': navMenuList,
        'mgrMenuList': mgrMenuList,
        'sentListID': sentListID,
        'dispaly': dispaly,
        'successnum': successnum,
        'errormsg': errormsg,
        'errornum': errornum,
        'total': total,
        'datetime': datetime
      });
    });
  });
  router.post('/ta/send/edit_act', [middleware.check(), middleware.checkEditPermission(permission.TA_DISPATCH_UPLOAD)], function (req, res) {
    var sentListID = req.body.sentListID || '';
    var sentListName = req.body.sentListName || '';
    var sentListDesc = req.body.sentListDesc || '';
    db.query("update cu_SentListMst set sentListName = '" + sentListName + "', sentListDesc = '" + sentListDesc + "'  where sentListID = " + sentListID, function (err, recordset) {
      res.redirect("/target/ta/send/edit?sentListID=" + sentListID);
    });

  });

  return router;
};