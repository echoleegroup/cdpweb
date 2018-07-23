"use strict";
const express = require('express');
const winston = require('winston');
const xlsx = require("node-xlsx");
const multer = require('multer');
const db = require("../utils/sql-server-connector").db;
const middleware = require("../middlewares/login-check");
const moment = require('moment');
const constants = require("../utils/constants");
const permission = constants.MENU_CODE;
const storage = constants.ASSERTS_FOLDER_PATH_ABSOLUTE;
const upload = multer({ dest: storage });
function toUP(value) {
  if (value == undefined)
    return "";
  else
    return value.toUpperCase();
};
module.exports = (app) => {
  winston.info('[talist_rspuploadRoute::create] Creating talist_rspupload route.');
  const router = express.Router();

  router.post('/ta/rsp/upload_act', [
    middleware.check(),
    middleware.checkEditPermission(permission.TA_DISPATCH_UPLOAD),
    upload.single('uploadingFile')
  ], function (req, res, next) {

    winston.info('/ta/rsp/upload_act get file');
    const _ = require('lodash');
    const COLUMN_MAPPER = {
      car: {xlsx: 'LISCNO', db: 'LICSNO'},
      uID: {xlsx: 'CustID', db: 'CustID_u'},
      VIN: {xlsx: 'VIN', db: 'VIN'}
    };
    const indexToRowNumberOffset = 2;
    const mdID = req.body.mdID || '';
    const batID = req.body.batID || '';
    const respListCateg = req.body.sentListCateg || '';
    const respListChannel = req.body.sentListChannel || '';
    const startDate = req.body.startDate || '';
    const respListName = req.body.sentListName || '';
    const respListDesc = req.body.sentListDesc || '';
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

    const validationSql = `SELECT ${dbKeyColumn} AS validation, LICSNO, CustID_u FROM cu_LicsnoIndex WHERE ${dbKeyColumn} IN ('${_.pull(keys, '').join(`','`)}') `;
    Q.nfcall(_connector.queryRequest().executeQuery, validationSql).then(licsDataSet => {
      // winston.info('get validation and licsno: ', licsDataSet);
      const validation = _.keyBy(licsDataSet, 'validation');

      const initSql = 'INSERT INTO cu_RespListMst(mdID,batID,respListName,respListChannel,respListDesc,respListTime,updTime,updUser) ' +
          'OUTPUT INSERTED.respListID ' +
          'VALUES(@mdID, @batID, @respListName, @respListChannel, ' +
          '@respListDesc, @respListTime, @updTime, @updUser)';

      return Q.nfcall(_connector.queryRequest()
        .setInput('mdID', _connector.TYPES.NVarChar, mdID)
        .setInput('batID', _connector.TYPES.NVarChar, batID)
        .setInput('respListName', _connector.TYPES.NVarChar, respListName)
        .setInput('respListChannel', _connector.TYPES.NVarChar, respListChannel)
        .setInput('respListDesc', _connector.TYPES.NVarChar, respListDesc)
        .setInput('respListTime', _connector.TYPES.DateTime, moment(startDate, 'YYYY/MM/DD').toDate())
        .setInput('updTime', _connector.TYPES.DateTime, new Date())
        .setInput('updUser', _connector.TYPES.NVarChar, req.user.userId)
        .executeQuery, initSql)
        .then(resultSet => {

          const respListID = resultSet[0].respListID;

          winston.info('get init cu_RespListMst done, respListID = ', respListID);

          const insertSql = "INSERT INTO cu_RespListDet " +
            "(mdID, batID, respListID, uCustID, uLicsNO, uVIN, rptKey) " +
            "VALUES" +
            "(@mdID, @batID, @respListID, @CustID, @LICSNO, @VIN, @CustID_u)";
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
                  let request = _connector.queryRequest()
                    .setInput('mdID', _connector.TYPES.NVarChar, mdID)
                    .setInput('batID', _connector.TYPES.NVarChar, batID)
                    .setInput('respListID', _connector.TYPES.Int, respListID)
                    .setInput('CustID', _connector.TYPES.NVarChar, row[custIdColumnIndex])
                    .setInput('LICSNO', _connector.TYPES.NVarChar, row[licsNoColumnIndex])
                    .setInput('VIN', _connector.TYPES.NVarChar, row[vinColumnIndex])
                    .setInput('CustID_u', _connector.TYPES.NVarChar, licsData.CustID_u);


                  return Q.nfcall(request.executeUpdate, insertSql).then(resultSet => {
                    // winston.info('after execute insert');
                    messageBody.success_num += 1;
                    return null;
                  }).catch(err => {
                    winston.error('import reaction list failed: ', err);
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
            return respListID;
          });

        });

    }).then(respListID => {
      winston.info('insert complete: respListID = ', respListID);
      let messages = _.map(_.sortBy(messageBody.error_msg, ['line']), 'message');
      res.redirect('/target/ta/rsp/edit?' +
        `successnum=${messageBody.success_num}` +
        `&errormsg=${messages.join('\n')}` +
        `&errornum=${messageBody.error_num}` +
        `&total=${messageBody.total}&dispaly=block` +
        `&datetime=${moment().format('YYYY/MM/DD HH:mm:ss')}` +
        `&respListID=${respListID}`);
    }).fail(err => {
      winston.error('POST /ta/rsp/upload_act error: ', err);
      next(require('boom').internal());
    });
  });
  router.get('/ta/rsp/upload/:mdID/:batID', [middleware.check(), middleware.checkEditPermission(permission.TA_REACTION_UPLOAD)], function (req, res) {
    var mdID = req.params.mdID || '';
    var batID = req.params.batID || '';
    var batchlist;
    var sentListChannel;
    var items;
    var p1 = new Promise(function (resolve, reject) {
      db.query("SELECT batID,batName FROM md_Batch where mdID ='" + mdID + "' and ( isClosed <> 'Y' or isClosed is null )  and ( isDel <> 'Y' or isDel is null ) order by updTime desc ", function (err, recordset) {
        if (err) {
          reject(err);
        }
        batchlist = recordset.recordset;
        resolve(batchlist);
      });
    });

    var p3 = new Promise(function (resolve, reject) {
      db.query("SELECT codeValue,codeLabel FROM sy_CodeTable where codeGroup = 'RespListChannel'", function (err, recordset) {
        if (err) {
          reject(err);
        }
        sentListChannel = recordset.recordset;
        resolve(sentListChannel);
      });
    });
    Promise.all([p1, p3]).then(function (results) {
      db.query("SELECT mdName FROM md_Model where mdID = '" + mdID + "'", function (err, recordset) {
        if (err) {
          winston.error(err);
        }
        var modelList = req.session.modelList;
        var navMenuList = req.session.navMenuList;
        var mgrMenuList = req.session.mgrMenuList;
        items = recordset.recordset;
        res.render('talist_rspupload_add', {
          'user': req.user,
          'modelInfo': items[0],
          'modelList': modelList,
          'navMenuList': navMenuList,
          'mgrMenuList': mgrMenuList,
          'batchlist': batchlist,
          'sentListChannel': sentListChannel,
          'mdID': mdID
        });
      });
    }).catch(function (e) {
      winston.error(e);
    });
  });
  router.get('/ta/rsp/edit', [middleware.check(), middleware.checkEditPermission(permission.TA_REACTION_UPLOAD)], function (req, res) {
    var mdID = decodeURI(req.query.mdID) || '';
    var batID = decodeURI(req.query.batID) || '';
    var respListID = decodeURI(req.query.respListID) || '';
    var errormsg = decodeURI(req.query.errormsg) || '';
    var successnum = decodeURI(req.query.successnum) || '';
    var errornum = decodeURI(req.query.errornum) || '';
    var total = decodeURI(req.query.total) || '';
    var datetime = decodeURI(req.query.datetime) || '';
    var dispaly = decodeURI(req.query.dispaly) || '';
    var resInfo;
    db.query("SELECT mm.mdName,mb.batName,crlm.respListID,crlm.respListName,crlm.respListDesc,convert(varchar,crlm.respListTime,111)respListTime,convert(varchar,crlm.updTime,120) updTime,crlm.updUser,sc.codeLabel respListChannel,(select count(*) from cu_RespListDet crld where crld.respListID = crlm.respListID) count FROM cu_RespListMst crlm left join md_Model mm on crlm.mdID = mm.mdID left join md_Batch mb on mb.batID = crlm.batID left join  sy_CodeTable sc on sc.codeGroup ='RespListChannel' and sc.codeValue = crlm.RespListChannel where respListID =  " + respListID, function (err, recordset) {
      var modelList = req.session.modelList;
      var navMenuList = req.session.navMenuList;
      var mgrMenuList = req.session.mgrMenuList;
      resInfo = recordset.recordset;
      res.render('talist_rspupload_Edit', {
        'user': req.user,
        'resInfo': resInfo,
        'modelList': modelList,
        'navMenuList': navMenuList,
        'mgrMenuList': mgrMenuList,
        'dispaly': dispaly,
        'successnum': successnum,
        'errormsg': errormsg,
        'errornum': errornum,
        'total': total,
        'datetime': datetime
      });
    });
  });
  router.post('/ta/rsp/edit_act', [middleware.check(), middleware.checkEditPermission(permission.TA_REACTION_UPLOAD)], function (req, res) {
    var respListID = req.body.respListID || '';
    var respListName = req.body.respListName || '';
    var respListDesc = req.body.respListDesc || '';
    db.query("update cu_RespListMst set respListName = '" + respListName + "',respListDesc='" + respListDesc + "' where respListID =  " + respListID, function (err, recordset) {
      res.redirect("/target/ta/rsp/edit?respListID=" + respListID);
    });
  });
  return router;
};
