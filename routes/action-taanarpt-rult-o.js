"use strict";
// const http = require('http');
// const url = require('url');
const _ = require('lodash');
const boom = require('boom');
const moment = require('moment');
const path = require('path');
const Q = require('q');
const express = require('express');
const winston = require('winston');
// const appConfig = require("../app-config");
const middleware = require("../middlewares/login-check");
const constants = require("../utils/constants");
const permission = constants.MENU_CODE;
const _connector = require('../utils/sql-query-util');
const codeGroupHelper = require('../helpers/code-group-helper');
const fileHelper = require('../helpers/file-helper');
const modelService = require('../services/model-service');
const queryService = require('../services/query-log-service');
// const db = require("../utils/sql-server-connector").db;
// const java_api_endpoint = require("../app-config").get("JAVA_API_ENDPOINT");
const java_api_service = require('../services/java-api-service');
// const storage = constants.ASSERTS_FOLDER_PATH_ABSOLUTE;
module.exports = (app) => {
  winston.info('[taanarptRoute::create] Creating taanarpt route.');
  const router = express.Router();

  router.get('/taanarpt_rult/:mdID/:batID', [middleware.check(), middleware.checkViewPermission(permission.TAANARPT_RULT)], function (req, res) {
    var modelList = req.session.modelList;
    var navMenuList = req.session.navMenuList;
    var mgrMenuList = req.session.mgrMenuList;
    let mdID = req.params.mdID || '';
    let batID = req.params.batID || '';
    res.render('TAAnaRpt_Rult',
      {
        'user': req.user,
        'modelList': modelList,
        'navMenuList': navMenuList,
        'mgrMenuList': mgrMenuList,
        'mdID': mdID
      });
  });
  router.post('/getReport', [middleware.check(), middleware.checkViewPermission(permission.TAANARPT_RULT)], function (req, res) {
    let mdID = req.body.mdID || '';
    let url = "/jsoninfo/getReport.do?mdID=" + mdID;
    java_api_service.api(url, req, res, function (err, result) {
      res.json(result);
    });

  });
  router.post('/getReportDetail', [middleware.check(), middleware.checkViewPermission(permission.TAANARPT_RULT)], function (req, res) {
    let mdID = req.body.mdID || '';
    let batID = req.body.batID || '';
    let url = "/jsoninfo/getReportDetail.do?mdID=" + mdID + "&batID=" + batID;
    java_api_service.api(url, req, res, function (err, result) {
      res.json(result);
    });

  });

  router.post('/download_act', [middleware.check(), middleware.checkDownloadPermission(permission.TAANARPT_RULT)], function (req, res, next) {
    const mdID = req.body.mdID;
    const userId = req.user.userId;
    const sql = 'WITH sentList AS ( ' +
      '  SELECT *, DATEADD(YEAR, 1, sentListTime) AS sentListTimeAfterOneYear ' +
      '  FROM cu_SentListView ' +
      '  WHERE mdID = @mdID ' +
      '), ' +
      'slod AS ( ' +
      '  SELECT * ' +
      '  FROM cu_Slod ' +
      `  WHERE CNTSTS = '1' AND MOVSTS NOT IN ('6', '7') AND substring(CNTRNO, 2, 1) <> '5' ` +
      ') ' +
      'SELECT slod.*, slod.sentListTime, slod.sentListChannel, slod.respListTime, slod.respListChannel, ' +
      '       type1.CUSTNM AS class_1_name, type1.CUSTID AS class_1_uid, type1.MOBILE AS class_1_mobile, ' +
      '       type2.CUSTNM AS class_2_name, type2.CUSTID AS class_2_uid, type2.MOBILE AS class_2_mobile, ' +
      '       type3.CUSTNM AS class_3_name, type3.CUSTID AS class_3_uid, type3.MOBILE AS class_3_mobile ' +
      'FROM ( ' +
      '  SELECT * ' +
      '  FROM ( ' +
      '    SELECT all_sent.*, all_resp.respListTime, all_resp.respListID, all_resp.respListChannel, ' +
      '           ROW_NUMBER() OVER ( ' +
      '               PARTITION BY all_sent.CNTRNO, all_sent.batID, all_sent.rptKey, all_sent.uTel ' +
      '               ORDER BY all_sent.sentListTime DESC, all_resp.respListTime DESC) AS SEQ ' +
      '    FROM ( ' +
      '      SELECT slod.CNTRNO, sent.batID, sent.rptKey, sent.uTel, ' +
      '             sent.sentListID, sent.sentListTime, sent.sentListChannel, ' +
      '             slod.CARMDL, slod.ORDDT, slod.DLRCD, slod.BRNHCD ' +
      '      FROM slod ' +
      '      INNER JOIN sentList sent ON slod.CUSTID = sent.rptKey ' +
      '      AND slod.ORDDT >= sentListTime ' +
      '      AND slod.ORDDT <= sentListTimeAfterOneYear ' +
      '' +
      '      UNION ' +
      '' +
      '      SELECT slod.CNTRNO, sent.batID, sent.rptKey, sent.uTel, ' +
      '             sent.sentListID, sent.sentListTime, sent.sentListChannel, ' +
      '             slod.CARMDL, slod.ORDDT, slod.DLRCD, slod.BRNHCD ' +
      '      FROM slod ' +
      '      INNER JOIN sentList sent ON slod.MOBILE = sent.uTel ' +
      '      AND slod.ORDDT >= sentListTime ' +
      '      AND slod.ORDDT <= sentListTimeAfterOneYear ' +
      '    ) AS all_sent ' +
      '    LEFT JOIN ( ' +
      '      SELECT respMst.batID, respMst.respListTime, respMst.respListID, respMst.respListChannel ' +
      '      FROM cu_RespListMst respMst ' +
      '      INNER JOIN cu_RespListDet respDet ON respMst.mdID = @mdID AND respMst.respListID = respDet.respListID ' +
      '    ) AS all_resp ON all_sent.batID = all_resp.batID ' +
      '  ) AS seq_sent ' +
      '  WHERE SEQ = 1 ' +
      ') AS slod ' +
      `LEFT JOIN cu_Slod type1 ON type1.CUSTCLASS = '1' AND type1.CNTRNO = slod.CNTRNO ` +
      `LEFT JOIN cu_Slod type2 ON type2.CUSTCLASS = '2' AND type2.CNTRNO = slod.CNTRNO ` +
      `LEFT JOIN cu_Slod type3 ON type3.CUSTCLASS = '3' AND type3.CNTRNO = slod.CNTRNO `;

    const request = _connector.queryRequest()
      .setInput('mdID', _connector.TYPES.NVarChar, mdID);

    Q.all([
      Q.nfcall(request.executeQuery, sql),
      Q.nfcall(codeGroupHelper.getCodeGroupsMap, ['sentListChannel', 'RespListChannel']),
      Q.nfcall(modelService.getModel, mdID)
    ]).spread((resData, codeGroupMap, model) => {
      const header = [
        '訂單編號', '訂單領照人姓名', '訂單領照人身份證字號', '訂單領照人手機',
        '訂單訂約人姓名', '訂單訂約人身份證字號', '訂單訂約人手機', '訂單使用人姓名', '訂單使用人身份證字號', '訂單使用人手機',
        '車型', '受訂日', '經銷商', '營業所', '投放批次', '投放時間', '投放管道', '投放對象身分證', '投放對象手機',
        '回應時間', '回應管道'
      ];
      const sentListChannelMap = _.keyBy(codeGroupMap.sentListChannel, 'codeValue');
      const RespListChannelMap = _.keyBy(codeGroupMap.RespListChannel, 'codeValue');
      // init xlsx data set
      const exportDateSet = [];
      exportDateSet.push(header); //header
      resData.forEach(row => {  //content
        exportDateSet.push([
          row.CNTRNO, row.class_1_name, row.class_1_uid, row.class_1_mobile,
          row.class_2_name, row.class_2_uid, row.class_2_mobile, row.class_3_name, row.class_3_uid, row.class_3_mobile,
          row.CARMDL, row.ORDDT, row.DLRCD, row.BRNHCD, row.batID,
          row.sentListTime, sentListChannelMap[row.sentListChannel], row.rptkey, row.uTel,
          row.respListTime, RespListChannelMap[row.respListChannel]
        ]);
      });

      //generate excel file
      let now = moment().format('YYYYMMDDHHmm');
      let exportFilename = `成效報表-${model.mdName}-${now}.xlsx`;
      let xlsxFilename = `ta-report-${model.mdID}-${now}.xlsx`;
      let xlsxFileAbsolutePath = path.join(constants.ASSERTS_FOLDER_PATH_ABSOLUTE, xlsxFilename);

      return Q.nfcall(fileHelper.buildXlsxFile, {
        xlsxDataSet: exportDateSet,
        xlsxFileAbsolutePath: xlsxFileAbsolutePath,
        password: userId.toLowerCase()
      }).then(stat => {
        // const zipBuff = fileHelper.buildZipBuffer({
        //   path: [xlsxFilename],
        //   buff: [xlsxBuffer],
        //   password: req.user.userId.toLowerCase()
        // });
        return Q.nfcall(queryService.insertDownloadLog, {
          queryId: undefined,
          filePath: xlsxFileAbsolutePath,
          userId: req.user.userId,
          fileSize: stat.size
        }).then(result => {
          res.download(xlsxFileAbsolutePath, exportFilename);
        });
      });
    }).fail(err => {
      winston.error(`===/taanarpt_rult/download_act(mdID=${mdID}): `, err);
      next(boom.internal())
    });
  });
  return router;
};