"use strict";
const express = require('express');
const winston = require('winston');
const db = require("../utils/sql-server-connector").db;
const middleware = require("../middlewares/login-check");
const permission = require("../utils/constants").menucode;
var java_api_endpoint = require("../app-config").get("JAVA_API_ENDPOINT");
const url = require('url');
const http = require('http');

module.exports = (app) => {
  console.log('[generaudicRoute::create] Creating generaudic route.');
  const router = express.Router();

  router.get('/cal/cp/:mdID/:batID',[middleware.check(), middleware.checkViewPermission(permission.GENE_RAUDIC)], function (req, res) {
    var mdID = req.params.mdID || '';
    var batID = req.params.batID || '';
    var where = " where mdID = '" + mdID + "' and batID = '" + batID + "' ";
    var tacount = 0;
    var tapopcount = 0;
    var splcount = 0;
    var modelInfo;
    var mdListCategCount = [];
    var items;
    var p1 = new Promise(function (resolve, reject) {
      db.query("SELECT mdName,batID,splName,splDesc,popName,popDesc,taName,taDesc,convert(varchar, updTime, 111)updTime FROM md_Model where mdID ='" + mdID + "' and batID = '" + batID + "' ", function (err, recordset) {
        if (err) {
          reject(err);
        }
        modelInfo = recordset.recordset[0];
        resolve(modelInfo);
      });
    });
    var p2 = new Promise(function (resolve, reject) {
      db.query("SELECT count(*) total ,mdListCateg FROM md_ListDet WHERE batID = '" + batID + "' and mdID ='" + mdID + "' and (mdListCateg ='spl' or mdListCateg ='tapop' or  mdListCateg ='ta') group by mdListCateg ", function (err, recordset) {
        if (err) {
          reject(err);
        }
        for (var i = 0; i < recordset.rowsAffected; i++) {
          if (recordset.recordset[i].mdListCateg == 'spl') {
            var item1 = {
              "mdListCateg": "已購客群",
              "total": recordset.recordset[i].total,
              "color": "#f2b530"
            }
            splcount = recordset.recordset[i].total;
          }
          else if (recordset.recordset[i].mdListCateg == 'tapop') {
            var item1 = {
              "mdListCateg": "潛在客群",
              "total": recordset.recordset[i].total,
              "color": "#d4d4d4"
            }
            tapopcount = recordset.recordset[i].total;
          }
          else if (recordset.recordset[i].mdListCateg == 'ta') {
            var item1 = {
              "mdListCateg": "模型受眾",
              "total": recordset.recordset[i].total,
              "color": "#f56b58"
            }
            tacount = recordset.recordset[i].total;
          }
          mdListCategCount.push(item1);
        }

        resolve(mdListCategCount);
      });
    });
    Promise.all([p1, p2]).then(function (results) {
      var modelList = req.session.modelList;
      var navMenuList = req.session.navMenuList;
      var mgrMenuList = req.session.mgrMenuList;
      res.render('generaudicCP', {
        'id': req.session.userid,
        'tacount': tacount,
        'mdListCategCount': JSON.stringify(mdListCategCount),
        'mdID': mdID,
        'batID': batID,
        'navMenuList': navMenuList,
        'modelList': modelList,
        'mgrMenuList': mgrMenuList,
        'tapopcount': tapopcount,
        'splcount': splcount,
        'api': java_api_endpoint,
        'modelInfo': modelInfo
      });

    }).catch(function (e) {
      console.log(e);

    });
  });

  router.post('/cal/getInfo', function (req, res) {
    var mdID = req.body.mdID || '';
    var batID = req.body.batID || '';
    var path = "/jsoninfo/generaudic.do?mdID=" + encodeURI(mdID) + "&batID=" + encodeURI(batID);
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

  router.post('/cal/getFeat', function (req, res) {
    var mdID = req.body.mdID || '';
    var batID = req.body.batID || '';
    var featID = req.body.featID || '';
    var path = "/jsoninfo/generaudicfeat.do?mdID=" + mdID + "&batID=" + batID + "&featID=" + featID;
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
