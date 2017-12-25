"use strict";
const express = require('express');
const winston = require('winston');
const middleware = require("../middlewares/login-check");
const permission = require("../utils/permission").menucode;
const db = require("../utils/sql-server-connector").db;

module.exports = (app) => {
  console.log('[modelRoute::create] Creating model route.');
  const router = express.Router();

  router.get('/modelList', [middleware.check(), middleware.checkViewPermission(permission.MODEL_LIST)], function (req, res) {
    var startDate = req.query.startDate || '';
    var endDate = req.query.endDate || '';
    var isClosed = req.query.isClosed || '';
    var condition = [];
    var where = " where sc.codeGroup = 'mdGoal' and sc.codeValue = mm.mdGoal and mm.mdID = mb.mdID and mm.batID = mb.batID and ( mm.isDel <> 'Y' or mm.isDel is null) ";
    if (startDate != '') {
      where += " and exeDateFrom >= '" + startDate + " 00:00:00' ";
      condition.push({
        "query": "起:" + startDate
      });
    }
    if (endDate != '') {
      where += " and exeDateFrom <= '" + endDate + " 23:59:59' ";
      condition.push({
        "query": "終:" + endDate
      });
    }
    if (isClosed == 'on') {
      where += " and ( mm.isClosed is not null or mm.isClosed is null ) ";
      condition.push({
        "query": "含已結案模型"
      });

    }
    else {
      where += " and ( mm.isClosed <> 'Y' or mm.isClosed is null ) ";
    }
    db.query("SELECT mm.*,convert(varchar, mb.lastTime, 111)lastTime,sc.codeLabel FROM md_Model mm,md_Batch mb,sy_CodeTable sc " + where + " order by mb.lastTime desc", function (err, recordset) {
      //send records as a respons
      var modelList = req.session.modelList;
      var navMenuList = req.session.navMenuList;
      var mgrMenuList = req.session.mgrMenuList;
      res.render('commonList', {
        'id': req.session.userid,
        'items': recordset.recordset,
        'condition': JSON.stringify(condition),
        'modelList': modelList,
        'navMenuList': navMenuList,
        'mgrMenuList': mgrMenuList,
      });
    });
  });
  router.get('/modelContent', [middleware.check(), middleware.checkViewPermission(permission.MODEL_LIST)], function (req, res) {
    if (req.session.userid && req.session.userid != '') {
      var mdID = req.query.mdID || '';
      var batID = req.query.batID || '';
      var modelInfo = "";
      var batcharray = "";
      var newBatchName = "";
      var newBatchLastTime = "";
      var p1 = new Promise(function (resolve, reject) {
        db.query("SELECT mm.mdID,mm.mdName,sc.codeLabel,mm.mdClient,mm.batBinded,mm.taDesc,convert(varchar,mm.exeDateFrom,111)exeDateFrom,convert(varchar,mm.exeDateTo,111)exeDateTo,mm.isClosed,convert(varchar,mm.updTime,120)updTime,convert(varchar,mm.crtTime,120)crtTime,convert(varchar,mm.mdRptCalTime,120)mdRptCalTime,mm.updUser "
          + " FROM md_Model mm "
          + " left join sy_CodeTable sc on mm.mdGoal = sc.codeValue and sc.codeGroup = 'mdGoal' "
          + " where mm.mdID = '" + mdID + "'", function (err, recordset) {
            if (err) {
              reject(err);
            }
            modelInfo = recordset.recordset[0];
            resolve(modelInfo);
          });
      });
      var p2 = new Promise(function (resolve, reject) {
        db.query("SELECT batID,batName,batDesc,convert(varchar,lastTime,120)lasttime,(select count(*) from cu_SentListDet csld where csld.mdID = '" + mdID + "' and csld.batID = mb.batID )sentcount,(select count(*) from cu_RespListDet crld where crld.mdID = '" + mdID + "' and crld.batID = mb.batID)respcount "
          + " FROM md_Batch mb "
          + " where (mb.isDel != 'Y' or mb.isDel is null ) and mb.mdID = '" + mdID + "'"
          + " order by mb.LastTime desc ", function (err, recordset) {
            if (err) {
              reject(err);
            }
            if (recordset.rowsAffected > 0) {
              batcharray = recordset.recordset;
              newBatchName = recordset.recordset[0].batName;
              newBatchLastTime = recordset.recordset[0].lasttime;
            }
            resolve(batcharray);
          });
      });
      Promise.all([p1, p2]).then(function (results) {
        var modelList = req.session.modelList;
        var navMenuList = req.session.navMenuList;
        var mgrMenuList = req.session.mgrMenuList;
        res.render('modelCP', {
          'id': req.session.userid,
          'batID': batID,
          'modelInfo': modelInfo,
          'batcharray': batcharray,
          'newBatchName': newBatchName,
          'newBatchLastTime': newBatchLastTime,
          'modelList': modelList,
          'navMenuList': navMenuList,
          'mgrMenuList': mgrMenuList
        });
      }).catch(function (e) {
        console.log(e);
      });
    }
    else {
      res.render(VIEW + 'index', { 'title': req.session.userid, 'items': "" });
    }
  });
  router.post('/modleCPeditAct', [middleware.check(), middleware.checkEditPermission(permission.MODEL_LIST)], function (req, res) {
    if (req.session.userid && req.session.userid != '') {
      var mdID = req.body.mdID || '';
      var batID = req.body.batID || '';
      var exeDateFrom = req.body.exeDateFrom || '';
      var exeDateTo = req.body.exeDateTo || '';
      var taDesc = req.body.taDesc || '';
      var isClosed = req.body.isClosed || '';
      if (isClosed == "on")
        isClosed = "Y";
      db.query("update md_Model set exeDateFrom ='" + exeDateFrom + "', exeDateTo = '" + exeDateTo + "', taDesc = '" + taDesc + "', isClosed = '" + isClosed + "'"
        + " where mdID = '" + mdID + "'", function (err, recordset) {
          res.redirect("/model/modelContent?mdID=" + mdID + "&batID=" + batID);
        });
    }
    else {
      res.render(VIEW + 'index', { 'title': req.session.userid, 'items': "" });
    }
  });
  router.post('/sentDetail', function (req, res) {
    var mdID = req.body.mdID || '';
    var batID = req.body.batID || '';
    var sentarray = "";
    db.query("SELECT cslm.sentListID, cslm.sentListName, sc.codeLabel sentListCateg, sct.codeLabel sentListChannel, cslm.sentListDesc, convert(varchar,cslm.sentListTime,120)sentListTime, convert(varchar,cslm.updTime,111)updTime, cslm.updUser, (select count(*) from cu_SentListDet csld where csld.sentListID = cslm.sentListID )sentcount "
      + " FROM cu_SentListMst cslm "
      + " left join sy_CodeTable sc on sc.codeGroup = 'sentListCateg' and sc.codeValue = cslm.sentListCateg "
      + " left join sy_CodeTable sct on sct.codeGroup = 'sentListChannel' and sct.codeValue = cslm.sentListChannel "
      + " where cslm.mdID = '" + mdID + "' and cslm.batID = '" + batID + "' "
      + "order by cslm.sentListTime desc", function (err, recordset) {
        if (recordset.rowsAffected > 0) {
          sentarray = recordset.recordset;
        }
        res.json(sentarray);
      });
  });
  router.post('/respDetail', function (req, res) {
    var mdID = req.body.mdID || '';
    var batID = req.body.batID || '';
    var resparray = "";
    db.query("SELECT crlm.respListID, crlm.respListName, sc.codeLabel respListChannel, crlm.respListDesc, convert(varchar,crlm.respListTime,120)respListTime, convert(varchar,crlm.updTime,111)updTime, crlm.updUser, (select count(*) from cu_RespListDet crld where crld.respListID = crlm.respListID )respcount "
      + "FROM  cu_RespListMst crlm "
      + " left join sy_CodeTable sc on sc.codeGroup = 'respListChannel' and sc.codeValue = crlm.respListChannel "
      + " where crlm.mdID = '" + mdID + "' and crlm.batID = '" + batID + "'"
      + "　order by crlm.respListTime desc", function (err, recordset) {
        if (err) {
          console(err);
        }
        if (recordset.rowsAffected > 0) {
          resparray = recordset.recordset;
        }
        res.json(resparray);
      });
  });
  return router;
};
