"use strict";
const express = require('express');
const winston = require('winston');
const middleware = require("../middlewares/login-check");
const permission = require("../utils/constants").MENU_CODE;
const db = require("../utils/sql-server-connector").db;


module.exports = (app) => {
  winston.info('[EvtpgRoute::create] Creating Evtpg route.');
  const router = express.Router();

  router.post('/act/tag/add', [middleware.check(), middleware.checkEditPermission(permission.EVENT_PAGE_EDIT)], function (req, res) {
    var evtpgID = req.body.evtpgID;
    var newtag = req.body.newtag;
    var issame = '';
    var tagID;
    newtag = newtag.trim();
    var p1 = new Promise(function (resolve, reject) {
      db.query("SELECT evtpgID FROM dm_EvtpgTag where evtpgID='" + evtpgID + "' and tagLabel ='" + newtag + "' and ( isDel <> 'Y' or isDel is null ) ", function (err, recordset) {
        if (err) {
          winston.error(err);
          reject(2);
        }
        if (recordset.rowsAffected != 0)
          issame = 'Y';
        else
          issame = 'N';
        resolve(1);
      });
    });
    Promise.all([p1]).then(function (results) {
      if (issame == 'Y')
        res.end("已新增過");
      else {
        function addtag(evtpgID, newtag, callback) {
          db.query("INSERT INTO dm_EvtpgTag(evtpgID,tagLabel,tagSource,crtTime,updTime,updUser) VALUES('" + evtpgID + "','" + newtag + "','m',GETDATE(),GETDATE(),'" + req.user.userId + "') ", function (err, recordset) {
            if (err)
              callback(err, null);
            else
              callback(null, 0);
          });
        }
        addtag(evtpgID, newtag, function (err, data) {
          if (err)
            winston.error("ERROR : ", err);
          else {
            db.query("SELECT TOP 1 tagID FROM dm_EvtpgTag where evtpgID ='" + evtpgID + "' order by tagID desc  ", function (err, recordset) {
              if (err)
                winston.error(err);
              tagID = recordset.recordset[0].tagID;
              res.end(tagID.toString());
            });
          }
        });
      }
    }).catch(function (e) {
      winston.error(e);
    });


  });
  router.post('/act/tag/del', function (req, res) {
    var evtpgID = req.body.evtpgID;
    var tagID = req.body.tagID;
    db.query("UPDATE dm_EvtpgTag set isDel = 'Y',updTime = GETDATE(),updUser = '" + req.user.userId + "' where evtpgID ='" + evtpgID + "' and tagID = " + tagID, function (err, recordset) {
      if (err) winston.error(err);
      res.end('ok');
    });
  });
  router.get('/act/add', [middleware.check(), middleware.checkEditPermission(permission.EVENT_PAGE_EDIT)], function (req, res) {
    var modelList = req.session.modelList;
    var navMenuList = req.session.navMenuList;
    var mgrMenuList = req.session.mgrMenuList;
    var funcCatge = '';

    db.query("SELECT codeValue,codeLabel FROM sy_CodeTable where codeGroup = 'funcCatge'  order by codeValue desc ", function (err, recordset) {
      if (err) winston.error(err);
      funcCatge = recordset.recordset;
      res.render('EvtpgAdd', {
        'user': req.user,
        'funcCatge': funcCatge,
        'modelList': modelList,
        'navMenuList': navMenuList,
        'mgrMenuList': mgrMenuList,
      });
    });


  });
  router.get('/act/search', [middleware.check(), middleware.checkViewPermission(permission.EVENT_PAGE_LIST)], function (req, res) {
    var funcCatge;
    var modelList = req.session.modelList;
    var navMenuList = req.session.navMenuList;
    var mgrMenuList = req.session.mgrMenuList;

    var p1 = new Promise(function (resolve, reject) {
      db.query("SELECT codeValue,codeLabel FROM sy_CodeTable where codeGroup = 'funcCatge' order by codeValue desc ", function (err, recordset) {
        if (err) {
          winston.error(err);
          reject(2);
        }
        funcCatge = recordset.recordset;
        resolve(1);
      });
    });
    Promise.all([p1]).then(function (results) {
      res.render('EvtpgSearch', {
        'user': req.user,
        'modelList': modelList,
        'navMenuList': navMenuList,
        'mgrMenuList': mgrMenuList,
        'funcCatge': funcCatge
      });
    }).catch(function (e) {
      winston.error(e);
    });


  });
  router.get('/act/edit', [middleware.check(), middleware.checkEditPermission(permission.EVENT_PAGE_LIST)], function (req, res) {
    var evtpgID = req.query.evtpgID;
    var modelList = req.session.modelList;
    var navMenuList = req.session.navMenuList;
    var mgrMenuList = req.session.mgrMenuList;
    var maininfo = '';
    var atag;
    var mtag;
    var funcCatgeList;

    var p1 = new Promise(function (resolve, reject) {
      db.query("SELECT evtpgID,sno,client,sc.codeLabel,url,funcCatge,convert(varchar, sdt, 111)sdt,convert(varchar, edt, 111)edt,tpc,convert(varchar, trkSdt, 111)trkSdt,convert(varchar, trkEdt, 111)trkEdt,evtpgDesc,isDel,convert(varchar, crtTime, 120)crtTime,convert(varchar, dem.updTime, 120)updTime,dem.updUser,(select count(*)  from dm_EvtadMst where evtpgID = dem.evtpgID) adCount,(SELECT count (distinct deam.evtadID) FROM dm_EvtadMst deam ,dm_EvtadTag det where deam.evtadID = det.evtadID and (det.isDel is null  or det.isDel <>'Y') and dem.evtpgID = deam.evtpgID)adtagcount,(select top 1 convert(varchar, deam.updTime, 120)  from dm_EvtadMst deam where deam.evtpgID = dem.evtpgID order by deam.updTime desc )adudtime,(select top 1 deam.updUser  from dm_EvtadMst deam where deam.evtpgID = dem.evtpgID order by deam.updTime desc )aduduser FROM dm_EvtpgMst_View dem left join sy_CodeTable sc on sc.codeGroup ='funcCatge' and sc.codeValue = dem.funcCatge where evtpgID ='" + evtpgID + "'", function (err, recordset) {
        if (err) {
          winston.error(err);
          reject(2);
        }
        maininfo = recordset.recordset[0];
        resolve(1);
      });
    });
    var p2 = new Promise(function (resolve, reject) {
      db.query("SELECT evtpgID,tagID,tagLabel,tagSource,isDel FROM dm_EvtpgTag where (isDel is null  or isDel <>'Y' ) and tagSource ='m' and evtpgID = '" + evtpgID + "'", function (err, recordset) {
        if (err) {
          winston.error(err);
          reject(2);
        }
        mtag = recordset.recordset;
        resolve(1);
      });
    });
    var p3 = new Promise(function (resolve, reject) {
      db.query("SELECT evtpgID,tagID,tagLabel,tagSource,isDel FROM dm_EvtpgTag where (isDel is null  or isDel <>'Y' ) and tagSource ='a' and evtpgID = '" + evtpgID + "'", function (err, recordset) {
        if (err) {
          winston.error(err);
          reject(2);
        }
        atag = recordset.recordset;
        resolve(1);
      });
    });
    var p4 = new Promise(function (resolve, reject) {
      db.query("SELECT codeValue,codeLabel FROM sy_CodeTable where codeGroup = 'funcCatge'  order by codeValue desc ", function (err, recordset) {
        if (err) {
          reject(err);
        }
        funcCatgeList = recordset.recordset;
        resolve(funcCatgeList);
      });
    });
    Promise.all([p1, p2, p3, p4]).then(function (results) {
      res.render('EvtpgEdit', {
        'user': req.user,
        'modelList': modelList,
        'navMenuList': navMenuList,
        'mgrMenuList': mgrMenuList,
        'atag': atag,
        'mtag': mtag,
        'maininfo': maininfo,
        'evtpgID': evtpgID,
        'funcCatge': funcCatgeList
      });
    }).catch(function (e) {
      winston.error(e);
    });
  });
  router.post('/act/edit_act', [middleware.check(), middleware.checkEditPermission(permission.EVENT_PAGE_EDIT)], function (req, res) {

    var values = 'values(';
    var evtpgID = req.body.evtpgID || '';
    var datasource = '';
    values += "'" + evtpgID + "',";
    var client = req.body.client || '';
    values += "'" + client + "',";
    var sno = req.body.sno || '';
    values += sno + ",";
    var funcCatge = req.body.funcCatge || '';
    values += "'" + funcCatge + "',";
    var msm_tpc = req.body.msm_tpc || '';
    values += "'" + msm_tpc + "',";
    var url = req.body.url || '';
    values += "'" + url + "',";
    var sdt = req.body.sdt || '';
    values += "'" + sdt + "',";
    var edt = req.body.edt || '';
    if (edt == '')
      values += "null";
    else
      values += "'" + edt + "',";
    var trkSdt = req.body.trkSdt || '';
    values += "'" + trkSdt + "',";
    var trkEdt = req.body.trkEdt || '';
    if (trkEdt == trkSdt)
      values += "'" + trkEdt + "',";
    else
      values += "'" + trkEdt + "',";
    var isDel = req.body.isDel || '';
    if (isDel == 'on')
      isDel = 'Y';
    else
      isDel = 'N';
    values += "'" + isDel + "',";
    var evtpgDesc = req.body.evtpgDesc || '';
    values += "'" + evtpgDesc + "',"
    values += "getdate(),getdate(),'" + req.user.userId + "')";
    var p1 = new Promise(function (resolve, reject) {
      if (sno != '') {
        db.query("SELECT sno FROM dm_EvtpgMst where sno is not null and sno = " + sno, function (err, recordset) {
          if (err)
            reject(err);
          if (recordset.rowsAffected == 0) {
            datasource = "news";
          }
          else
            datasource = "dem";
          resolve(datasource);
        });
      }
      else {
        datasource = "dem";
        resolve(datasource);
      }
    });
    Promise.all([p1]).then(function (results) {
      if (datasource == "news") {
        db.query("INSERT INTO dm_EvtpgMst(evtpgID,client,sno,funcCatge,tpc,url,sdt,edt,trkSdt,trkEdt,isDel,evtpgDesc,crtTime,updTime,updUser)" + values, function (err, recordset) {
          if (err) {
            winston.error(err);
          }
        });
      }
      else {
        db.query("UPDATE dm_EvtpgMst set client ='" + client + "',funcCatge = '" + funcCatge + "',tpc = '" + msm_tpc + "',url = '" + url + "',sdt = '" + sdt + "',edt = '" + edt + "',trkSdt = '" + trkSdt + "',trkEdt = '" + trkEdt + "',isDel = '" + isDel + "',evtpgDesc = '" + evtpgDesc + "',updTime =GETDATE(),updUser = '" + req.user.userId + "' where evtpgID = '" + evtpgID + "'", function (err, recordset) {
          if (err) {
            winston.error(err);
          }
        });
      }
      res.redirect('/actad/act/edit?evtpgID=' + evtpgID);
    }).catch(function (e) {
      winston.error(e);
    });

  });

  router.post('/act/add_act', [middleware.check(), middleware.checkEditPermission(permission.EVENT_PAGE_EDIT)], function (req, res) {
    var modelList = req.session.modelList;
    var navMenuList = req.session.navMenuList;
    var mgrMenuList = req.session.mgrMenuList;
    var values = 'values(';
    values += "'M'+CONVERT(varchar(10),(select top 1 num+1 from dm_EvtpgMst order by num desc)), ";
    var client = req.body.client || '';
    values += "'" + client + "',";
    var funcCatge = req.body.funcCatge || '';
    values += "'" + funcCatge + "',";
    var msm_tpc = req.body.msm_tpc || '';
    values += "'" + msm_tpc + "',";
    var url = req.body.url || '';
    values += "'" + url + "',";
    var sdt = req.body.sdt || '';
    values += "'" + sdt + "',";
    var edt = req.body.edt || '';
    if (edt == '')
      values += "null";
    else
      values += "'" + edt + "',";
    var trkSdt = req.body.trkSdt || '';
    values += "'" + trkSdt + "',";
    var trkEdt = req.body.trkEdt || '';
    if (trkEdt == trkSdt)
      values += "'" + trkEdt + "',";
    else
      values += "'" + trkEdt + "',";
    var isDel = req.body.isDel || '';
    if (isDel == 'on')
      isDel = 'Y';
    else
      isDel = 'N';
    values += "'" + isDel + "',";
    var evtpgDesc = req.body.evtpgDesc || '';
    values += "'" + evtpgDesc + "',"
    values += "getdate(),getdate(),'" + req.user.userId + "')";
    var evtpgID = '';
    var p1 = new Promise(function (resolve, reject) {
      db.query("INSERT INTO dm_EvtpgMst(evtpgID,client,funcCatge,tpc,url,sdt,edt,trkSdt,trkEdt,isDel,evtpgDesc,crtTime,updTime,updUser)" + values, function (err, recordset) {
        if (err) {
          winston.error(err);
          reject(2);
        }
        resolve(1);
      });
    });
    Promise.all([p1]).then(function (results) {
      db.query("SELECT Top 1 evtpgID FROM dm_EvtpgMst order by crtTime desc ", function (err, recordset) {
        if (err)
          winston.error(err);
        evtpgID = recordset.recordset[0].evtpgID;
        res.redirect('/actad/act/edit?evtpgID=' + evtpgID);
      });

    }).catch(function (e) {
      winston.error(e);
    });

  });
  router.post('/act/list', [middleware.check(), middleware.checkViewPermission(permission.EVENT_PAGE_LIST)], function (req, res) {
    var modelList = req.session.modelList;
    var navMenuList = req.session.navMenuList;
    var mgrMenuList = req.session.mgrMenuList;
    var client = req.body.client || '';
    var funcCatge = req.body.funcCatge || '';
    var sdt = req.body.sdt || '';
    var edt = req.body.edt || '';
    var tpc = req.body.tpc || '';
    var sql = '';
    var maininfo = [];
    var data = [];
    var taginfo = [];
    var adlist = [];
    var ad = [];
    var where = " where 1 = 1 and dem.client = '" + client + "' ";
    if (funcCatge != '')
      where += " and dem.funcCatge = '" + funcCatge + "' ";
    if (sdt != '' && edt != '')
      where += " and ( (dem.sdt >= '" + sdt + " 00:00:00' and dem.edt <= '" + edt + " 23:59:59' ) or ( dem.sdt <= '" + sdt + " 23:59:59' and dem.edt >= '" + sdt + " 00:00:00') or ( dem.sdt <= '" + edt + " 23:59:59' and dem.edt >= '" + edt + " 00:00:00') or ( dem.sdt <= '" + sdt + " 23:59:59' and dem.edt >= '" + edt + " 00:00:00'))";
    else if (sdt != '')
      where += " and ( (dem.sdt >= '" + sdt + " 00:00:00' ) or ( dem.sdt <= '" + sdt + " 23:59:59' and dem.edt >= '" + sdt + " 00:00:00') )";
    if (tpc != '')
      where += " and dem.tpc like '%" + tpc + "%' ";

    var p1 = new Promise(function (resolve, reject) {
      db.query("SELECT ROW_NUMBER() OVER (ORDER BY dem.sdt ASC) as no, evtpgID,client,sc.codeLabel,url,convert(varchar, sdt, 111)sdt,convert(varchar, edt, 111)edt,tpc,convert(varchar, dem.updTime, 120)updTime,(select count(*)  from dm_EvtadMst where evtpgID = dem.evtpgID) adCount,(SELECT count (distinct deam.evtadID) FROM dm_EvtadMst deam ,dm_EvtadTag det where deam.evtadID = det.evtadID and (det.isDel is null  or det.isDel <>'Y') and dem.evtpgID = deam.evtpgID)adtagcount FROM dm_EvtpgMst_View dem left join sy_CodeTable sc on sc.codeGroup = 'funcCatge' and sc.codeValue = dem.funcCatge " + where + " order by dem.sdt asc ", function (err, recordset) {
        if (err) {
          winston.error(err);
          reject(2);
        }
        for (var i = 0; i < recordset.rowsAffected; i++) {
          maininfo = [];
          maininfo.push({
            no: recordset.recordset[i].no,
            evtpgID: recordset.recordset[i].evtpgID,
            client: recordset.recordset[i].client,
            codeLabel: recordset.recordset[i].codeLabel,
            sdt: recordset.recordset[i].sdt,
            edt: recordset.recordset[i].edt,
            msm_tpc: recordset.recordset[i].tpc,
            adCount: recordset.recordset[i].adCount,
            adtagcount: recordset.recordset[i].adtagcount,
            updTime: recordset.recordset[i].updTime,
            url: recordset.recordset[i].url
          });
          data.push({
            maininfo: maininfo
          });
        }
        resolve(1);
      });
    });
    var p2 = new Promise(function (resolve, reject) {
      db.query("SELECT ROW_NUMBER() OVER (ORDER BY a.adSdt ASC) as no,a.*, (select count(*) from dm_EvtadTag b where a.evtadID = b.evtadID and( b.isDel <> 'Y' or b.isDel is null)) sumtag FROM dm_EvtadMst a order by a.adSdt asc ", function (err, recordset) {
        if (err) {
          winston.error(err);
          reject(2);
        }
        for (var i = 0; i < recordset.rowsAffected; i++) {
          ad.push({
            no: recordset.recordset[i].no,
            evtadID: recordset.recordset[i].evtadID,
            evtpgID: recordset.recordset[i].evtpgID,
            adSource: recordset.recordset[i].adSource,
            adChannel: recordset.recordset[i].adChannel,
            adPos: recordset.recordset[i].adPos,
            adSize: recordset.recordset[i].adSize,
            sumtag: recordset.recordset[i].sumtag

          });
        }
        resolve(1);
      });
    });
    Promise.all([p1, p2]).then(function (results) {
      db.query("SELECT det.evtpgID,det.tagID,det.tagLabel,det.tagSource FROM dm_EvtpgTag det where  det.evtpgID in( SELECT dem.evtpgID FROM dm_EvtpgMst_View dem " + where + " ) and ( isDel is null or isDel <>'Y') ", function (err, recordset) {
        if (err)
          winston.error(err);
        for (var i = 0; i < data.length; i++) {
          taginfo = [];
          for (var j = 0; j < recordset.rowsAffected; j++) {
            if (data[i].maininfo[0].evtpgID == recordset.recordset[j].evtpgID) {
              taginfo.push({
                tag: recordset.recordset[j].tagLabel
              });
            }

          }
          data[i].maininfo.push({
            taginfo: taginfo
          });
        }
        for (var i = 0; i < data.length; i++) {
          adlist = [];
          let count = 1;
          for (var j = 0; j < ad.length; j++) {
            if (data[i].maininfo[0].evtpgID == ad[j].evtpgID) {
              ad[j].no = count;
              count++;
              adlist.push({
                ad: ad[j]
              });
            }
          }
          data[i].maininfo.push({
            adlist: adlist
          });
        }
        res.render('EvtpgList', {
          'user': req.user,
          'items': recordset.recordset,
          'modelList': modelList,
          'navMenuList': navMenuList,
          'mgrMenuList': mgrMenuList,
          'data': JSON.stringify(data)
        });
      });
    }).catch(function (e) {
      winston.error(e);
    });
  });
  router.get('/act/analysis/search', [middleware.check(), middleware.checkViewPermission(permission.EVENT_PAGE_Analysis)], function (req, res) {
    let funcCatge;
    let modelList = req.session.modelList;
    let navMenuList = req.session.navMenuList;
    let mgrMenuList = req.session.mgrMenuList;

    let p1 = new Promise(function (resolve, reject) {
      db.query("SELECT codeValue,codeLabel FROM sy_CodeTable where codeGroup = 'funcCatge' order by codeValue desc ", function (err, recordset) {
        if (err) {
          reject(err);
        }
        funcCatge = recordset.recordset;
        resolve(funcCatge);
      });
    });
    Promise.all([p1]).then(function (results) {
      res.render('evtpg-analysis-search', {
        'user': req.user,
        'modelList': modelList,
        'navMenuList': navMenuList,
        'mgrMenuList': mgrMenuList,
        'funcCatge': funcCatge
      });
    }).catch(function (e) {
      winston.error(e);
    });


  });
  router.post('/act/analysis/list', [middleware.check(), middleware.checkViewPermission(permission.EVENT_PAGE_Analysis)], function (req, res) {
    let modelList = req.session.modelList;
    let navMenuList = req.session.navMenuList;
    let mgrMenuList = req.session.mgrMenuList;
    let client = req.body.client || '';
    let funcCatge = req.body.funcCatge || '';
    let sdt = req.body.sdt || '';
    let edt = req.body.edt || '';
    let tpc = req.body.tpc || '';
    let sql = '';
    let maininfo = [];
    let data = [];
    let mainifolist = [];
    let taginfo = [];
    let adlist = [];
    let ad = [];
    let where = " where 1 = 1 and dem.client = '" + client + "' ";
    if (funcCatge != '')
      where += " and dem.funcCatge = '" + funcCatge + "' ";
    if (sdt != '')
      where += " and dem.sdt >= '" + sdt + " 00:00:00' ";
    if (edt != '')
      where += " and dem.edt <= '" + edt + " 23:59:59' ";
    if (tpc != '')
      where += " and dem.tpc like '%" + tpc + "%' ";

    let p1 = new Promise(function (resolve, reject) {
      db.query("SELECT ROW_NUMBER() OVER (ORDER BY dem.sdt ASC) as no, dem.evtpgID,sc.codeLabel,url,convert(varchar, trkSdt, 111)sdt,convert(varchar, trkEdt, 111)edt,tpc,dems.browseCount,dems.cookieCount,dems.dxidCount,dems.canvasCount,dems.licsnoCount FROM dm_EvtpgMst_View dem left join dm_EvtpgMst_statistic dems on dems.evtpgID = dem.evtpgID  left join sy_CodeTable sc on sc.codeGroup = 'funcCatge' and sc.codeValue = dem.funcCatge " + where + " order by dem.sdt asc ", function (err, recordset) {
        if (err) {
          reject(err);
        }
        for (var i = 0; i < recordset.rowsAffected; i++) {
          maininfo = [];
          maininfo.push({
            no: recordset.recordset[i].no,
            evtpgID: recordset.recordset[i].evtpgID,
            codeLabel: recordset.recordset[i].codeLabel,
            sdt: recordset.recordset[i].sdt,
            edt: recordset.recordset[i].edt,
            msm_tpc: recordset.recordset[i].tpc,
            browseCount: recordset.recordset[i].browseCount,
            cookieCount: recordset.recordset[i].cookieCount,
            dxidCount: recordset.recordset[i].dxidCount,
            canvasCount: recordset.recordset[i].canvasCount,
            licsnoCount: recordset.recordset[i].licsnoCount,
            url: recordset.recordset[i].url
          });
          data.push({
            maininfo: maininfo
          });
        }
        resolve(1);
      });
    });
    let p2 = new Promise(function (resolve, reject) {
      db.query("SELECT ROW_NUMBER() OVER (ORDER BY a.adSdt ASC) as no,a.*,dems.browseCount,dems.cookieCount,dems.dxidCount,dems.canvasCount FROM dm_EvtadMst a left join dm_EvtadMst_statistic dems on dems.evtadID = a.evtadID order by a.adSdt asc ", function (err, recordset) {
        if (err) {
          reject(2);
        }
        for (var i = 0; i < recordset.rowsAffected; i++) {
          ad.push({
            no: recordset.recordset[i].no,
            evtadID: recordset.recordset[i].evtadID,
            evtpgID: recordset.recordset[i].evtpgID,
            adSource: recordset.recordset[i].adSource,
            adChannel: recordset.recordset[i].adChannel,
            adPos: recordset.recordset[i].adPos,
            adSize: recordset.recordset[i].adSize,
            browseCount: recordset.recordset[i].browseCount,
            cookieCount: recordset.recordset[i].cookieCount,
            dxidCount: recordset.recordset[i].dxidCount,
            canvasCount: recordset.recordset[i].canvasCount

          });
        }
        resolve(1);
      });
    });
    Promise.all([p1, p2]).then(function (results) {

      for (var i = 0; i < data.length; i++) {
        adlist = [];
        let count = 1;
        for (var j = 0; j < ad.length; j++) {
          if (data[i].maininfo[0].evtpgID == ad[j].evtpgID) {
            ad[j].no = count;
            count++;
            adlist.push({
              ad: ad[j]
            });
          }
        }
        data[i].maininfo.push({
          adlist: adlist
        });
      }
      res.render('event-analysis-list', {
        'user': req.user,
        'modelList': modelList,
        'navMenuList': navMenuList,
        'mgrMenuList': mgrMenuList,
        'data': JSON.stringify(data)
      });

    }).catch(function (e) {
      winston.error(e);
    });
  });

  return router;
};