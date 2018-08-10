"use strict";
const fs = require('fs');
const _ = require('lodash');
const http = require('http');
const url = require('url');
const path = require('path');
const express = require('express');
const winston = require('winston');
const moment = require('moment');
const appConfig = require("../app-config");
const criteriaHelper = require('../helpers/criteria-helper');
const customTargetHelper = require('../helpers/custom-target-helper');
const modelHelper = require('../helpers/model-helper');
const queryLogService = require('../services/query-log-service');
const exportService = require('../services/export-service');
const modelService = require('../services/model-service');
const criteriaService = require('../services/custom-target-service');
const middleware = require("../middlewares/login-check");
const constants = require('../utils/constants');
const permission = constants.MENU_CODE;
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

  const modelTargetDnldRestrictionDispatcher = (restriction, model, records, lowerBound, upperBound) => {
    switch (restriction) {
      case 'RECORDS':
        return [
          modelHelper.thresholdRestrictionCustomizer(model.batListThold, 1),
          modelHelper.recordRestrictionCustomizer(records)
        ];
      case 'THRESHOLD':
        return modelHelper.thresholdRestrictionCustomizer(lowerBound, upperBound)
    }
  };

  router.post('/model/download_act',
    [middleware.check(), middleware.checkDownloadPermission(permission.MODEL_DOWNLOAD)],
    (req, res, next) => {
      const mdID = req.body.mdID;
      const batID = req.body.batID;
      const records = parseInt(req.body.records);
      const tapopCount = parseInt(req.body.tapopCount);
      const thresholdLowerBound = parseFloat(req.body.thresholdLowerBound);
      const thresholdUpperBound = parseFloat(req.body.thresholdUpperBound);
      const restriction = req.body.restriction;

      winston.info('mdID: ', mdID);
      winston.info('batID: ', batID);
      winston.info('records: ', records);
      winston.info('tapopCount: ', tapopCount);
      winston.info('thresholdLowerBound: ', thresholdLowerBound);
      winston.info('thresholdUpperBound: ', thresholdUpperBound);
      winston.info('restriction: ', restriction);

      Q.all([
        Q.nfcall(modelService.getBatchTargetInfoOfCategory, mdID, batID, criteriaHelper.MODEL_LIST_CATEGORY),
        Q.nfcall(exportService.getDownloadFeaturesOfSet, criteriaHelper.CUSTOMER_FEATURE_SET_ID)
      ]).spread((model, downloadFeatures) => {
        const queryFields = _.map(_.filter(downloadFeatures, {customized: 'N'}), 'featID');
        const exportFeatureIds = _.map(downloadFeatures, 'featID');
        const exportFeatureLabels = _.map(downloadFeatures, 'featName');
        const pluginHandlers = [
          customTargetHelper.get_mdListScoreCustomizer(),
          customTargetHelper.get_mdListSentCustomizer(mdID),
          customTargetHelper.get_mdListSlodCustomizer()
        ].concat(
          modelTargetDnldRestrictionDispatcher(restriction, model, records, thresholdLowerBound, thresholdUpperBound));

        return Q.nfcall(
          criteriaService.queryTargetByCustomCriteria, mdID, batID, [], model, queryFields, pluginHandlers
        ).then(resultSet => {
          //arrange result set into specific format, to export as xlsx by node-xlsx
          let exportDateSet = [exportFeatureLabels].concat(resultSet.map(row => { //transform resultSet[{row},{row}] into[[row],[row]]
            //transform row object into array in the order of exportFeatureIds
            return exportFeatureIds.map(featId => row[featId]);
          }));

          const fileHelper = require('../helpers/file-helper');
          let now = moment().format('YYYYMMDDHHmm');
          const exportFilename = `模型名單-${model.mdName}-${model.batName}-${now}.xlsx`;
          const xlsxFilename = `model-target-${model.mdID}-${model.batID}-${now}.xlsx`;
          const xlsxFileAbsolutePath = path.join(constants.ASSERTS_CUSTOM_TARGET_ASSERTS_PATH_ABSOLUTE, xlsxFilename);

          return Q.nfcall(fileHelper.buildXlsxFile, {
            xlsxDataSet: exportDateSet,
            xlsxFileAbsolutePath: xlsxFileAbsolutePath,
            password: req.user.userId.toLowerCase()
          }).then(stat => {
            // const zipBuff = fileHelper.buildZipBuffer({
            //   path: [xlsxFilename],
            //   buff: [xlsxBuffer],
            //   password: req.user.userId.toLowerCase()
            // });
            return Q.nfcall(queryLogService.insertDownloadLog, {
              queryId: 'modelDownload',
              filePath: xlsxFileAbsolutePath,
              userId: req.user.userId,
              fileSize: stat.size
            }).then(result => {
              res.download(xlsxFileAbsolutePath, exportFilename)
              // const zipContentType = 'application/octet-stream';
              // const contentDisposition = require('content-disposition');
              //
              // res.setHeader('Content-Type', zipContentType);
              // res.setHeader("Content-Disposition", contentDisposition(`${filename}.zip`));
              // res.setHeader('Content-Transfer-Encoding', 'binary');
              // res.setHeader('Content-Length', zipBuff.length);
              //
              // res.end(new Buffer(zipBuff, 'binary'));
            })
          });
        });
      }).fail(err => {
        if (err) {
          winston.error(`===/${mdID}/${batID}/model/download_act: `, err);
          next(require('boom').internal());
        }
      });
  });

  router.post('/model/download/update', [middleware.check(), middleware.checkDownloadPermission(permission.MODEL_DOWNLOAD)], function (req, res) {
    let mdID = req.body.mdID;
    let batID = req.body.batID;
    let lowerBound = req.body.lowerBound;
    let upperBound = req.body.upperBound;
    let sql = "SELECT count(*) total " +
      " FROM md_ListDet mld " +
      " left join md_Model mm on mm.mdID = mld.mdID and mm.batID = mld.batID " +
      " where mld.mdID = @mdID  and mld.batID = @batID " +
      " and mld.mdListCateg ='tapop' and mld.mdListScore >= @lowerBound " +
      " and mld.mdListScore <= @upperBound ";
    let request = _connector.queryRequest()
      .setInput('mdID', _connector.TYPES.NVarChar, mdID)
      .setInput('batID', _connector.TYPES.NVarChar, batID)
      .setInput('lowerBound', _connector.TYPES.Float, lowerBound)
      .setInput('upperBound', _connector.TYPES.Float, upperBound);
    Q.nfcall(request.executeQuery, sql).then((resultSet) => {
      res.json(resultSet[0]);
    }).fail((err) => {
      winston.error('====[modelUpload] query modelUpload failed: ', err);
      res.send(err);
    });

  });
  return router;
};