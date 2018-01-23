"use strict";
const http = require('http');
const url = require('url');
const express = require('express');
const winston = require('winston');
const appConfig = require("../app-config");
const middleware = require("../middlewares/login-check");
const permission = require("../utils/constants").MENU_CODE;
const db = require("../utils/sql-server-connector").db;
const java_api_endpoint = require("../app-config").get("JAVA_API_ENDPOINT");
const java_api_service = require('../services/java-api-service');
module.exports = (app) => {
  console.log('[taanarptRoute::create] Creating taanarpt route.');
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
    let path = "/jsoninfo/getReport.do?mdID=" + mdID;
    java_api_service.api(path, req, res, function (err, result) {
      res.json(result);
    });

  });
  router.post('/getReportDetail', [middleware.check(), middleware.checkViewPermission(permission.TAANARPT_RULT)], function (req, res) {
    let mdID = req.body.mdID || '';
    let batID = req.body.batID || '';
    let path = "/jsoninfo/getReportDetail.do?mdID=" + mdID+"&batID="+batID;
    java_api_service.api(path, req, res, function (err, result) {
      res.json(result);
    });

  });
  return router;
};



