"use strict";
const fs = require('fs');
const _ = require('lodash');
const http = require('http');
const url = require('url');
const express = require('express');
const winston = require('winston');
const appConfig = require("../app-config");
const queryLogService = require('../services/query-log-service');
const middleware = require("../middlewares/login-check");
const permission = require("../utils/constants").MENU_CODE;
const db = require("../utils/sql-server-connector").db;
const _connector = require('../utils/sql-query-util');
const Q = require('q');

module.exports = (app) => {
  winston.info('[modelDownloadRoute::create] Creating modelDownload route.');
  const router = express.Router();

  router.get('/model/download/:mdID/:batID', [middleware.check(), middleware.checkDownloadPermission(permission.MODEL_DOWNLOAD)], function (req, res) {
    var mdID = req.params.mdID || '';
    var batID = req.params.batID || '';
    var where = " where mdID = '" + mdID + "' and batID = '" + batID + "' and mdListCateg ='tapop' order by mdListScore asc ";
    var items;
    var scrore = 0.8;
    var chartData = [];
    var batListThold = 0.0;
    var modelInfo;
    var mdListCategCount = [];
    var tacount = 0;
    var tapopcount = 0;
    var splcount = 0;
    var p1 = new Promise(function (resolve, reject) {
      db.query("SELECT batListThold FROM md_ListMst WHERE batID = '" + batID + "' and mdID ='" + mdID + "'  ", function (err, recordset) {
        if (err) {
          reject(err);
        }
        batListThold = recordset.recordset[0].batListThold;
        resolve(batListThold);
      });
    });
    var p2 = new Promise(function (resolve, reject) {
      db.query("SELECT mm.mdName,mm.batID,mm.splName,mm.splDesc,mm.popName,mm.popDesc,mm.taName,mm.taDesc,convert(varchar, mm.updTime, 111)updTime,mb.batName FROM md_Model mm,md_Batch mb where mm.mdID = mb.mdID and mm.batID = mb.batID and  mm.mdID ='" + mdID + "' and mm.batID = '" + batID + "' ", function (err, recordset) {
        if (err) {
          reject(err);
        }
        modelInfo = recordset.recordset[0];
        resolve(modelInfo);
      });
    });
    var p3 = new Promise(function (resolve, reject) {
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
    Promise.all([p1, p2, p3]).then(function (results) {
      db.query("SELECT mdListScore FROM md_ListDet " + where, function (err, recordset) {
        if (err) {
          winston.error(err);

        }
        var x = 0.0;
        var total = 0;
        for (x = 0; x <= 100; x = x + 5) {
          for (var i = 0; i < recordset.rowsAffected; i++) {
            if (x <= recordset.recordset[i].mdListScore * 100 && recordset.recordset[i].mdListScore * 100 < x + 5)
              total++;
          }
          if (x < batListThold * 100) {
            var item1 = {
              "lineColor": "#d4d4d4",
              "mdListScore": x / 100,
              "total": total
            }
          }
          else {
            var item1 = {
              "lineColor": "#7caf0c",
              "mdListScore": x / 100,
              "total": total
            }

          }
          chartData.push(item1);
          total = 0;
        }
        var modelList = req.session.modelList;
        var navMenuList = req.session.navMenuList;
        var mgrMenuList = req.session.mgrMenuList;
        res.render('modelDownload', {
          'user': req.user,
          'chartData': JSON.stringify(chartData),
          'tacount': tacount,
          'mdListCategCount': JSON.stringify(mdListCategCount),
          'modelInfo': modelInfo,
          'batListThold': batListThold,
          'mdID': mdID,
          'batID': batID,
          'modelList': modelList,
          'navMenuList': navMenuList,
          'mgrMenuList': mgrMenuList,
          'tapopcount': tapopcount,
          'splcount': splcount
        });
      });
    }).catch(function (e) {
      winston.error(e);
    });
  });

  router.get('/model/download_act', [middleware.check(), middleware.checkDownloadPermission(permission.MODEL_DOWNLOAD)], function (req, res) {
    var mdID = req.query.mdID || '';
    var batID = req.query.batID || '';
    var tapopcount = req.query.tapopcount || '';
    var ex12c = req.query.ex12c || '';
    var num = req.query.num || '';
    var usemethod = req.query.method || '';
    var path = "/jsoninfo/downloadxls.do?mdID=" + encodeURI(mdID) + "&batID=" + encodeURI(batID) + "&scope=" + encodeURI(ex12c) + "&total=" + num + "&method=" + usemethod + "&tapopcount=" + tapopcount;
    var urlPaser = url.parse(appConfig.get('JAVA_API_ENDPOINT'));
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
        const path = JSON.parse(msg).jsonOutput.data;
        const stats = fs.statSync(path);
        const fileName = JSON.parse(msg).jsonOutput.filename;
        Q.nfcall(queryLogService.insertDownloadLog, {
          queryId: 'modelDownload',
          filePath: path,
          userId: req.user.userId,
          fileSize: stats.size
        }).then(logId => {
          res.setHeader('Content-Type', 'application/vnd.openxmlformats');
          res.setHeader("Content-Disposition", "attachment; filename=" + fileName + ".xls");
          res.sendFile(path);
        });
      });
    }).end();
  });

  router.post('/model/download/update', [middleware.check(), middleware.checkDownloadPermission(permission.MODEL_DOWNLOAD)], function (req, res) {
    let mdID = req.body.mdID || '';
    let batID = req.body.batID || '';
    let scope = req.body.scope || '';
    let min = scope.split(",")[0];
    let max = scope.split(",")[1];
    let sql = "SELECT count(*) total " +
      " FROM md_ListDet mld " +
      " left join md_Model mm on mm.mdID = mld.mdID and mm.batID = mld.batID " +
      " where mld.mdID = @mdID  and mld.batID = @batID " +
      " and mld.mdListCateg ='tapop' and mld.mdListScore >= @min " +
      " and mld.mdListScore <= @max ";
    let request = _connector.queryRequest()
      .setInput('mdID', _connector.TYPES.NVarChar, mdID)
      .setInput('batID', _connector.TYPES.NVarChar, batID)
      .setInput('min', _connector.TYPES.Float, parseFloat(min))
      .setInput('max', _connector.TYPES.Float, parseFloat(max));
    Q.nfcall(request.executeQuery, sql).then((resultSet) => {
      res.json(resultSet[0]);
    }).fail((err) => {
      winston.error('====[modelUpload] query modelUpload failed: ', err);
      res.send(err);
    });

  });
  return router;
};