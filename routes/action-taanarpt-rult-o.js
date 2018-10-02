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
const orderHelper = require('../helpers/order-helper');
const fileHelper = require('../helpers/file-helper');
const modelService = require('../services/model-service');
const queryService = require('../services/query-log-service');
// const db = require("../utils/sql-server-connector").db;
// const java_api_endpoint = require("../app-config").get("JAVA_API_ENDPOINT");
const java_api_service = require('../services/java-api-service');
const orderService = require('../services/order-service');
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

  router.post('/download_act/:mdID',
    [middleware.check(), middleware.checkDownloadPermission(permission.TAANARPT_RULT)],
    function(req, res, next) {

    const mdID = req.params.mdID;
    const userId = req.user.userId;

    Q.all([
      Q.nfcall(orderService.getOrderDetailOfModelTarget, mdID),
      Q.nfcall(codeGroupHelper.getPortalSyCodeGroupsMap, ['sentListChannel', 'RespListChannel']),
      Q.nfcall(modelService.getModel, mdID)
    ]).spread((resData, codeGroupMap, model) => {
      //generate excel file
      let now = moment().format('YYYYMMDDHHmm');
      let exportFilename = `成效報表-${model.mdName}-${now}.xlsx`;
      let xlsxFilename = `ta-report-${model.mdID}-${now}.xlsx`;
      let xlsxFileAbsolutePath = path.join(constants.ASSERTS_FOLDER_PATH_ABSOLUTE, xlsxFilename);

      return Q.nfcall(orderHelper.modelTargetOrderDataXslxGenerator, resData, codeGroupMap,
        xlsxFileAbsolutePath, userId.toLowerCase()).then(stat => {

        return Q.nfcall(queryService.insertDownloadLog, {
          queryId: mdID,
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

  router.post('/download_act/:mdID/:batID',
    [middleware.check(), middleware.checkDownloadPermission(permission.TAANARPT_RULT)],
    function(req, res, next) {

      const mdID = req.params.mdID;
      const batID = req.params.batID;
      const userId = req.user.userId;

      Q.all([
        Q.nfcall(orderService.getOrderDetailOfModelBatchTarget, mdID, batID),
        Q.nfcall(codeGroupHelper.getPortalSyCodeGroupsMap, ['sentListChannel', 'RespListChannel']),
        Q.nfcall(modelService.getBatch, mdID. batID)
      ]).spread((resData, codeGroupMap, model) => {
        //generate excel file
        let now = moment().format('YYYYMMDDHHmm');
        let exportFilename = `成效報表-${model.mdName}-${model.batName}-${now}.xlsx`;
        let xlsxFilename = `ta-report-${mdID}-${batID}-${now}.xlsx`;
        let xlsxFileAbsolutePath = path.join(constants.ASSERTS_FOLDER_PATH_ABSOLUTE, xlsxFilename);

        return Q.nfcall(orderHelper.modelTargetOrderDataXslxGenerator, resData, codeGroupMap,
          xlsxFileAbsolutePath, userId.toLowerCase()).then(stat => {

          return Q.nfcall(queryService.insertDownloadLog, {
            queryId: mdID,
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