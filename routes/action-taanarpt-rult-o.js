"use strict";
const http = require('http');
const url = require('url');
const express = require('express');
const winston = require('winston');
const appConfig = require("../app-config");
const middleware = require("../middlewares/login-check");
const permission = require("../utils/constants").menucode;
const db = require("../utils/sql-server-connector").db;
const java_api_endpoint = require("../app-config").get("JAVA_API_ENDPOINT");
module.exports = (app) => {
  console.log('[taanarptRoute::create] Creating taanarpt route.');
  const router = express.Router();

  router.get('/TAAnaRpt_Rult', [middleware.check(), middleware.checkViewPermission(permission.TAANARPT_RULT)], function (req, res) {
    var modelList = req.session.modelList;
    var navMenuList = req.session.navMenuList;
    var mgrMenuList = req.session.mgrMenuList;
    var mdID = req.query.mdID || '';
    res.render('TAAnaRpt_Rult',
      {
        'id': req.session.userid,
        'modelList': modelList,
        'navMenuList': navMenuList,
        'mgrMenuList': mgrMenuList,
        'mdID': mdID,
        'api': java_api_endpoint
      });
  });
  return router;
};



