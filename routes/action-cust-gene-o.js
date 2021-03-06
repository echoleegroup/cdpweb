"use strict";
const express = require('express');
const winston = require('winston');
const middleware = require("../middlewares/login-check");
const permission = require("../utils/constants").MENU_CODE;
const db = require("../utils/sql-server-connector").db;
const url = require('url');
const java_api_endpoint = require("../app-config").get("JAVA_API_ENDPOINT");
const http = require('http');

module.exports = (app) => {
  winston.info('[custGeneRoute::create] Creating custGene route.');
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
      db.query("SELECT mm.*,convert(varchar, mb.lastTime, 111)lastTime,mb.batName FROM md_Model mm,md_Batch mb where mm.mdID = mb.mdID and mm.batID = mb.batID and mm.mdID = '" + mdID + "' and mm.batID ='" + batID + "'", function (err, recordset) {
        items = recordset.recordset;
        var modelList = req.session.modelList;
        var navMenuList = req.session.navMenuList;
        var mgrMenuList = req.session.mgrMenuList;
        res.render('custGeneCP', {
          'user': req.user,
          'modelInfo': items[0],
          'popNum': popNum,
          'splNum': splNum,
          'modelList': modelList,
          'navMenuList': navMenuList,
          'mgrMenuList': mgrMenuList,
        });
      });

    }).catch(function (e) {
      winston.error(e);
    });
  });

  router.post('/cust/char/getInfo', function (req, res) {
    var mdID = req.body.mdID || '';
    var batID = req.body.batID || '';
    var path = "/jsoninfo/custGene.do?mdID=" + encodeURI(mdID) + "&batID=" + encodeURI(batID);
    var urlPaser = url.parse(java_api_endpoint);
    var options = {
      protocol: urlPaser.protocol,
      host: urlPaser.hostname,
      port: urlPaser.port,
      path: path,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json; charset=utf-8'
      }
    };
    http.request(options, function (resp) {
      var msg = '';
      resp.setEncoding('utf8');
      resp.on('data', function (chunk) {
        msg += chunk;
      });
      resp.on('end', function () {
        res.json(JSON.parse(msg));
      });
    }).end();
  });

  router.post('/cust/char/getFeat', function (req, res) {
    var mdID = req.body.mdID || '';
    var batID = req.body.batID || '';
    var featID = req.body.featID || '';
    var path = "/jsoninfo/custfeat.do?mdID=" + mdID + "&batID=" + batID + "&featID=" + featID;
    var urlPaser = url.parse(java_api_endpoint);
    var options = {
      protocol: urlPaser.protocol,
      host: urlPaser.hostname,
      port: urlPaser.port,
      path: path,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json; charset=utf-8'
      }
    };
    http.request(options, function (resp) {
      var msg = '';
      resp.setEncoding('utf8');
      resp.on('data', function (chunk) {
        msg += chunk;
      });
      resp.on('end', function () {
        res.json(JSON.parse(msg));
      });
    }).end();
  });
  return router;
};
