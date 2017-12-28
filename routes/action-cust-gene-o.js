"use strict";
const express = require('express');
const winston = require('winston');
const middleware = require("../middlewares/login-check");
const permission = require("../utils/permission").menucode;
const db = require("../utils/sql-server-connector").db;
const java_api_endpoint = require("../config/app-config").get("JAVA_API_ENDPOINT");

module.exports = (app) => {
  console.log('[custGeneRoute::create] Creating custGene route.');
  const router = express.Router();

  router.get('/cust/char/cp/:mdID/:batID', [middleware.check(), middleware.checkViewPermission(permission.CUST_GENE)], function (req, res) {
    var mdID = req.params.mdID || '';
    var batID = req.params.batID || '';
    var where = " where mdID = '" + mdID + "' and batID = '" + batID + "' ";
    var splNum = 0;
    var popNum = 0;
    var items;
    var p1 = new Promise(function (resolve, reject) {
      db.query("select count(*) total from md_ListDet " + where + " and mdListCateg ='spl'", function (err, recordset) {
        if (err) {
          reject(err);
        }
        splNum = recordset.recordset[0].total;
        resolve(splNum);
      });
    });
    var p2 = new Promise(function (resolve, reject) {
      db.query("select count(*) total from md_ListDet " + where + " and mdListCateg ='pop'", function (err, recordset) {
        if (err) {
          reject(err);
        }
        popNum = recordset.recordset[0].total;
        resolve(popNum);
      });
    });
    Promise.all([p1, p2]).then(function (results) {
      db.query("SELECT mm.*,convert(varchar, mb.lastTime, 111)lastTime FROM md_Model mm,md_Batch mb where mm.mdID = mb.mdID and mm.batID = mb.batID and mm.mdID = '" + mdID + "' and mm.batID ='" + batID + "'", function (err, recordset) {
        items = recordset.recordset;
        var modelList = req.session.modelList;
        var navMenuList = req.session.navMenuList;
        var mgrMenuList = req.session.mgrMenuList;
        res.render('custGeneCP', {
          'id': req.session.userid,
          'modelInfo': items[0],
          'popNum': popNum,
          'splNum': splNum,
          'modelList': modelList,
          'navMenuList': navMenuList,
          'mgrMenuList': mgrMenuList,
          'api': java_api_endpoint
        });
      });

    }).catch(function (e) {
      console.log(e);
    });
  });

  return router;
};
