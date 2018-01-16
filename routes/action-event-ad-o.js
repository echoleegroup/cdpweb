"use strict";
const express = require('express');
const winston = require('winston');
const multer = require('multer');
const xlsx = require("node-xlsx");
const middleware = require("../middlewares/login-check");
const db = require("../utils/sql-server-connector").db;
const constants = require("../utils/constants");
const permission = constants.menucode;
const storage = constants.ASSERTS_ABSOLUTE_PATH;
const upload = multer({ dest: storage });

module.exports = (app) => {
  console.log('[EvtadRoute::create] Creating Evtad route.');
  const router = express.Router();

  router.post('/ad/upload_act', [middleware.check(), middleware.checkEditPermission(permission.EVENT_AD), upload.single('uploadingFile')], function (req, res) {
    var evtpgID = req.body.evtpgID || '';
    var optradio = req.body.optradio || '';
    var filepath = '';
    var Fromindex, Toindex, Websiteindex, Channelindex, Positionindex, Sizeindex, Urlindex;
    var total;
    var successnum = 0;
    var errornum = 0;
    var adCount = 0;
    var updUser;
    var updTime;
    var errormsg = '錯誤資訊\r\n';
    var allmsg = '';
    var funcCatge;
    var modelList = req.session.modelList;
    var navMenuList = req.session.navMenuList;
    var mgrMenuList = req.session.mgrMenuList;
    var mainInfo = '';
    var adInfo = '';
    var p1 = new Promise(function (resolve, reject) {
      if (optradio == "cover") {
        db.query("DELETE FROM dm_EvtadMst where evtpgID ='" + evtpgID + "'", function (err, recordset) {
          if (err) {
            console.log(err);
            reject(2);
          }
          resolve(1);
        });
      }
      else
        resolve(1);
    });
    var p2 = new Promise(function (resolve, reject) {
      db.query("SELECT evtpgID, client, funcCatge, convert(varchar, sdt, 111)sdt, convert(varchar, edt, 111)edt, msm_tpc FROM dm_EvtpgMst_View where evtpgID = '" + evtpgID + "'", function (err, recordset) {
        mainInfo = recordset.recordset[0];
        resolve(mainInfo);
      });
    });
    var p3 = new Promise(function (resolve, reject) {
      db.query("SELECT codeValue,codeLabel FROM sy_CodeTable where codeGroup = 'funcCatge' order by codeValue desc ", function (err, recordset) {
        if (err) {
          console.log(err);
          reject(2);
        }
        funcCatge = recordset.recordset;
        resolve(1);
      });
    });
    Promise.all([p1, p2, p3]).then(function (results) {
      var file = req.file;
      // 以下代碼得到檔案後綴
      var name = file.originalname;
      var nameArray = name.split('');
      var nameMime = [];
      var l = nameArray.pop();
      nameMime.unshift(l);
      while (nameArray.length != 0 && l != '.') {
        l = nameArray.pop();
        nameMime.unshift(l);
      } // Mime是檔案的後綴 Mime=nameMime.join('');
      // console.log(Mime); res.send("done"); //重命名檔案
      // 加上檔案後綴
      // fs.renameSync('./upload/'+file.filename,'./upload/'+file.filename+Mime);

      filepath = file.path;
      var list = xlsx.parse(filepath);
      total = list[0].data.length - 1;
      for (var i = 0; i < list[0].data[0].length; i++) {
        if (list[0].data[0][i] == "From") {
          Fromindex = i;

        }
        else if (list[0].data[0][i] == "To") {
          Toindex = i;

        }
        else if (list[0].data[0][i] == "Website") {
          Websiteindex = i;
        }
        else if (list[0].data[0][i] == "Channel") {
          Channelindex = i;
        }
        else if (list[0].data[0][i] == "Position") {
          Positionindex = i;
        }
        else if (list[0].data[0][i] == "Size") {
          Sizeindex = i;
        }
        else if (list[0].data[0][i] == "Url") {
          Urlindex = i;
        }
      }
      i = 1
      checkandinsert(i);
      function checkandinsert(i) {
        if (i < list[0].data.length) {
          if (list[0].data[i][Websiteindex] == undefined || list[0].data[i][Urlindex] == undefined) {
            errornum++;
            var linenum = i + 1;
            errormsg += 'Line ' + linenum.toString() + ','
            console.log(errormsg);
            for (var j = 0; j < list[0].data[i].length; j++) {
              if (j == list[0].data[i].length - 1)
                errormsg += list[0].data[i][j] + "\r\n";
              else
                errormsg += list[0].data[i][j] + ",";
            }
            if (i == list[0].data.length - 1) {
              db.query("SELECT top 1 convert(varchar,updTime,120)updTime,updUser,(select count(*) from dm_EvtadMst dem where dem.evtpgID = '" + evtpgID + "') adcount FROM dm_EvtadMst where evtpgID = '" + evtpgID + "'  order by updTime desc ", function (err, recordset) {
                updUser = recordset.recordset[0].updUser;
                updTime = recordset.recordset[0].updTime;
                adCount = recordset.recordset[0].adcount
                var currentdate = new Date();
                var datetime = currentdate.getFullYear() + "/" + (currentdate.getMonth() + 1) + "/" + currentdate.getDate() + " "
                  + currentdate.getHours() + ":"
                  + currentdate.getMinutes() + ":"
                  + currentdate.getSeconds();
                res.render('Evtad_upload', {
                  'id': req.session.userid,
                  'modelList': modelList,
                  'navMenuList': navMenuList,
                  'mgrMenuList': mgrMenuList,
                  "successnum": successnum,
                  'errormsg': errormsg,
                  'errornum': errornum,
                  'total': total,
                  'dispaly': 'block',
                  'datetime': datetime
                });
              });
            }
            checkandinsert(i + 1);
          }
          else {
            db.query("INSERT INTO dm_EvtadMst (evtpgID,url,adSource,adSdt,adEdt,adChannel,adPos,adSize,crtTime,updTime,updUser)VALUES('" + evtpgID + "','" + list[0].data[i][Urlindex] + "','" + list[0].data[i][Websiteindex] + "','" + list[0].data[i][Fromindex] + "','" + list[0].data[i][Toindex] + "','" + list[0].data[i][Channelindex] + "','" + list[0].data[i][Positionindex] + "','" + list[0].data[i][Sizeindex] + "',GETDATE(),GETDATE(),'" + req.session.userid + "')", function (err, recordset) {
              if (err) {
                console.log(err);
              }
              successnum++;
              if (i == list[0].data.length - 1) {
                db.query("SELECT top 1 convert(varchar,updTime,120)updTime,updUser,(select count(*) from dm_EvtadMst dem where dem.evtpgID = '" + evtpgID + "') adcount FROM dm_EvtadMst where evtpgID = '" + evtpgID + "'  order by updTime desc ", function (err, recordset) {
                  updUser = recordset.recordset[0].updUser;
                  updTime = recordset.recordset[0].updTime;
                  adCount = recordset.recordset[0].adcount
                  var currentdate = new Date();
                  var datetime = currentdate.getFullYear() + "/" + (currentdate.getMonth() + 1) + "/" + currentdate.getDate() + " "
                    + currentdate.getHours() + ":"
                    + currentdate.getMinutes() + ":"
                    + currentdate.getSeconds();
                  res.render('Evtad_upload', {
                    'id': req.session.userid,
                    'modelList': modelList,
                    'navMenuList': navMenuList,
                    'mgrMenuList': mgrMenuList,
                    "successnum": successnum,
                    'errormsg': errormsg,
                    'errornum': errornum,
                    'total': total,
                    'dispaly': 'block',
                    'datetime': datetime,
                    'mainInfo': mainInfo,
                    'updUser': updUser,
                    'updTime': updTime,
                    'adCount': adCount,
                    'funcCatge': funcCatge
                  });
                });
              }
              checkandinsert(i + 1);
            });
          }
        }
      }

    }).catch(function (e) {
      console.log(e);
    });
  });

  router.post('/ad/act_id/search', function (req, res) {
    var funcCatge = req.body.funcCatge;
    var client = req.body.client;
    var data = [];
    var p1 = new Promise(function (resolve, reject) {
      db.query("SELECT evtpgID,msm_tpc,convert(varchar, sdt, 111)sdt,convert(varchar, edt, 111)edt FROM dm_EvtpgMst_View where client = '" + client + "'  and funcCatge = '" + funcCatge + "' order by msm_tpc asc ", function (err, recordset) {
        if (err) {
          console.log(err);
          reject(2);
        }
        for (var i = 0; i < recordset.rowsAffected; i++) {
          data.push({
            value: recordset.recordset[i].evtpgID,
            msm_tpc: recordset.recordset[i].msm_tpc + "(" + recordset.recordset[i].sdt + "~" + recordset.recordset[i].edt + ")"
          });
        }
        resolve(1);
      });
    });
    Promise.all([p1]).then(function (results) {
      res.end(JSON.stringify(data));
    }).catch(function (e) {
      console.log(e);
    });
  });

  router.get('/ad/upload', [middleware.check(), middleware.checkEditPermission(permission.EVENT_AD)], function (req, res) {
    var successnum = req.query.successnum;
    var errormsg = req.query.errormsg || '';
    var errornum = req.query.errornum || '';
    var total = req.query.total || '';
    var dispaly = req.query.dispaly || '';
    var datetime = req.query.datetime || '';
    var evtpgID = req.query.evtpgID || '';
    var funcCatge;
    var mainInfo;
    var adcount = 0;
    var updUser, updTime;
    var modelList = req.session.modelList;
    var navMenuList = req.session.navMenuList;
    var mgrMenuList = req.session.mgrMenuList;
    var p1 = new Promise(function (resolve, reject) {
      db.query("SELECT codeValue,codeLabel FROM sy_CodeTable where codeGroup = 'funcCatge' order by codeValue desc ", function (err, recordset) {
        if (err) {
          console.log(err);
          reject(2);
        }
        funcCatge = recordset.recordset;
        resolve(1);
      });
    });
    var p2 = new Promise(function (resolve, reject) {
      if (evtpgID != '') {
        db.query("SELECT count(*)adcount FROM dm_EvtadMst where evtpgID = '" + evtpgID + "'", function (err, recordset) {
          if (err) {
            console.log(err);
            reject(2);
          }
          adcount = recordset.recordset[0].adcount;
          resolve(1);
        });
      }
      else
        resolve(1);
    });
    var p3 = new Promise(function (resolve, reject) {
      if (evtpgID != '') {
        db.query("SELECT TOP 1 convert(varchar, updTime, 120)updTime,updUser FROM dm_EvtadMst where evtpgID = '" + evtpgID + "' order by updTime desc ", function (err, recordset) {
          if (err) {
            console.log(err);
            reject(2);
          }
          if (recordset.rowsAffected > 0) {
            updTime = recordset.recordset[0].updTime;
            updUser = recordset.recordset[0].updUser;
          }
          resolve(1);
        });
      }
      else
        resolve(1);
    });
    var p4 = new Promise(function (resolve, reject) {
      if (evtpgID != '') {
        db.query("SELECT evtpgID, client, funcCatge, convert(varchar, sdt, 111)sdt, convert(varchar, edt, 111)edt, msm_tpc FROM dm_EvtpgMst_View where evtpgID = '" + evtpgID + "'", function (err, recordset) {
          if (recordset.rowsAffected > 0) {
            mainInfo = recordset.recordset[0];
          }
          resolve(mainInfo);
        });
      }
      else {
        resolve(mainInfo);
      }
    });
    Promise.all([p1, p2, p3, p4]).then(function (results) {
      res.render('Evtad_upload', {
        'id': req.session.userid,
        'modelList': modelList,
        'navMenuList': navMenuList,
        'mgrMenuList': mgrMenuList,
        'funcCatge': funcCatge,
        'successnum': successnum,
        'errormsg': errormsg,
        'errornum': errornum,
        'total': total,
        'dispaly': dispaly,
        'datetime': datetime,
        'updTime': updTime,
        'updUser': updUser,
        'adcount': adcount,
        'evtpgID': evtpgID,
        'mainInfo': mainInfo
      });
    }).catch(function (e) {
      console.log(e);
    });
  });

  router.post('/ad/tag/add', function (req, res) {
    var evtadID = req.body.evtadID;
    var newtag = req.body.newtag;
    var issame = '';
    var tagID;
    newtag = newtag.trim();
    var p1 = new Promise(function (resolve, reject) {
      db.query("SELECT evtadID FROM dm_EvtadTag where evtadID=" + evtadID + " and tagLabel ='" + newtag + "' ", function (err, recordset) {
        if (err) {
          console.log(err);
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
        const addtag = (evtadID, newtag, callback) => {
          db.query("INSERT INTO dm_EvtadTag(evtadID,tagLabel,updTime,updUser) VALUES(" + evtadID + ",'" + newtag + "',GETDATE(),'" + req.session.userid + "') ", function (err, recordset) {
            if (err)
              callback(err, null);
            else
              callback(null, 0);
          });
        }
        addtag(evtadID, newtag, function (err, data) {
          if (err)
            console.log("ERROR : ", err);
          else {
            db.query("SELECT TOP 1 tagID FROM dm_EvtadTag where evtadID =" + evtadID + " order by tagID desc  ", function (err, recordset) {
              if (err)
                console.log(err);
              tagID = recordset.recordset[0].tagID;
              res.end(tagID.toString());
            });
          }
        });
      }
    }).catch(function (e) {
      console.log(e);
    });


  });

  router.post('/ad/tag/del', function (req, res) {
    var evtadID = req.body.evtadID;
    var tagID = req.body.tagID;
    db.query("UPDATE dm_EvtadTag set isDel = 'Y' where evtadID =" + evtadID + " and tagID = " + tagID, function (err, recordset) {
      if (err) console.log(err);
      res.end('ok');
    });
  });

  router.post('/ad/edit_act', function (req, res) {
    var evtadID = req.body.evtadID;
    var adSdt = req.body.adSdt;
    var adEdt = req.body.adEdt;
    var adPos = req.body.adPos;
    var adSize = req.body.adSize;
    var url = req.body.url;
    db.query("update dm_EvtadMst set adSdt ='" + adSdt + "',adEdt ='" + adEdt + "',adPos ='" + adPos + "',adSize ='" + adSize + "',url ='" + url + "'  where evtadID =" + evtadID, function (err, recordset) {
      if (err) console.log(err);
      res.end('ok');
    });
  });

  router.post('/ad/del', function (req, res) {
    var evtadID = req.body.evtadID;
    var adSdt = req.body.adSdt;
    var adEdt = req.body.adEdt;
    var adPos = req.body.adPos;
    var adSize = req.body.adSize;
    var url = req.body.url;
    db.query("delete from dm_EvtadMst where evtadID =" + evtadID, function (err, recordset) {
      if (err) console.log(err);
      res.end('ok');
    });
  });

  router.get('/ad/list', [middleware.check(), middleware.checkViewPermission(permission.EVENT_AD)], function (req, res) {
    var modelList = req.session.modelList;
    var navMenuList = req.session.navMenuList;
    var mgrMenuList = req.session.mgrMenuList;
    var evtpgID = req.query.evtpgID || '';
    var msm_tpc = req.query.msm_tpc || '';
    var data = [];
    var taginfo = [];
    var adlist = [];
    var ad = [];
    var p1 = new Promise(function (resolve, reject) {
      db.query("SELECT ROW_NUMBER() OVER (ORDER BY a.adSdt ASC) as no,a.evtadID,a.evtpgID,a.url,a.adChannel,a.adSource,a.adPos,a.adSize,a.updUser,convert(varchar, a.adSdt, 111)adSdt,convert(varchar, a.adEdt, 111)adEdt,convert(varchar, a.updTime, 120)updTime, (select count(*) from dm_EvtadTag b where a.evtadID = b.evtadID) sumtag FROM dm_EvtadMst a where a.evtpgID ='" + evtpgID + "' order by a.adSdt asc ", function (err, recordset) {
        if (err) {
          console.log(err);
          reject(2);
        }
        for (var i = 0; i < recordset.rowsAffected; i++) {
          ad = [];
          ad.push({
            no: recordset.recordset[i].no,
            evtadID: recordset.recordset[i].evtadID,
            evtpgID: recordset.recordset[i].evtpgID,
            adSource: recordset.recordset[i].adSource,
            adChannel: recordset.recordset[i].adChannel,
            adPos: recordset.recordset[i].adPos,
            adSize: recordset.recordset[i].adSize,
            sumtag: recordset.recordset[i].sumtag,
            updTime: recordset.recordset[i].updTime,
            updUser: recordset.recordset[i].updUser,
            adSdt: recordset.recordset[i].adSdt,
            adEdt: recordset.recordset[i].adEdt,
            url: recordset.recordset[i].url


          });
          adlist.push({
            ad: ad
          });
        }

        resolve(1);
      });
    });
    Promise.all([p1]).then(function (results) {
      db.query("SELECT deat.* FROM dm_EvtadTag deat where deat.evtadID in ( select dem.evtadID from dm_EvtadMst dem where dem.evtpgID = '" + evtpgID + "' )", function (err, recordset) {
        if (err)
          console.log(err);
        for (var i = 0; i < adlist.length; i++) {
          taginfo = [];
          for (var j = 0; j < recordset.rowsAffected; j++) {
            if (adlist[i].ad[0].evtadID == recordset.recordset[j].evtadID) {
              taginfo.push({
                tag: recordset.recordset[j].tagLabel,
                tagID: recordset.recordset[j].tagID
              });
            }

          }
          adlist[i].ad.push({
            taginfo: taginfo
          });
        }
        console.log(JSON.stringify(adlist));
        res.render('EvadList', {
          'id': req.session.userid,
          'items': recordset.recordset,
          'modelList': modelList,
          'navMenuList': navMenuList,
          'mgrMenuList': mgrMenuList,
          'adlist': JSON.stringify(adlist),
          //'msm_tpc': msm_tpc, 
          'evtpgID': evtpgID
        });
      });
    }).catch(function (e) {
      console.log(e);
    });
  });

  return router;
};