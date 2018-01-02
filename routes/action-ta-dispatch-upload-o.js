"use strict";
const express = require('express');
const winston = require('winston');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const xlsx = require("node-xlsx");
const db = require("../utils/sql-server-connector").db;
const middleware = require("../middlewares/login-check");
const permission = require("../utils/constants").menucode;
const storage = path.resolve(__dirname, "../_upload") + path.sep;
const upload = multer({ dest: storage });;

module.exports = (app) => {
  console.log('[talist_putuploadRoute::create] Creating talist_putupload route.');
  const router = express.Router();

  router.post('/ta/send/upload_act', [middleware.check(), middleware.checkEditPermission(permission.TA_DISPATCH_UPLOAD), upload.single('uploadingFile')], function (req, res) {
    var mdID = req.body.mdID || '';
    var batID = req.body.batID || '';
    var sentListCateg = req.body.sentListCateg || '';
    var sentListChannel = req.body.sentListChannel || '';
    var startDate = req.body.startDate || '';
    var sentListName = req.body.sentListName || '';
    var sentListDesc = req.body.sentListDesc || '';
    var optradio = req.body.optradio || '';
    var filepath = '';
    var VINindex, CustIDindex, LISCNOindex;
    var key = '';
    var newindex;
    var total;
    var successnum = 0;
    var errornum = 0;
    var updtime;
    var errormsg = '錯誤資訊\r\n';
    var allmsg = '';
    if (optradio == 'car')
      key = 'LISCNO';
    else if (optradio == 'uID')
      key = 'CustID';
    else
      key = 'VIN';
    var keyindex = 0;
    var modelList = req.session.modelList;
    var navMenuList = req.session.navMenuList;
    var mgrMenuList = req.session.mgrMenuList;
    var p1 = new Promise(function (resolve, reject) {
      function getnewindex(mdID, callback) {
        db.query("INSERT INTO cu_SentListMst(mdID,batID,sentListName,sentListCateg,sentListChannel,sentListDesc,sentListTime,updTime,updUser) values('" + mdID + "','" + batID + "','" + sentListName + "','" + sentListCateg + "','" + sentListChannel + "','" + sentListDesc + "','" + startDate + "',GETDATE(),'" + req.session.userid + "')", function (err, recordset) {
          if (err) {
            reject(err);
          }
          callback(null, 0);
        });
      }
      getnewindex(mdID, function (err, data) {
        db.query("SELECT TOP 1 sentListID FROM cu_SentListMst where mdID ='" + mdID + "' and batID ='" + batID + "' order by sentListID desc ", function (err, recordset) {
          newindex = recordset.recordset[0].sentListID;
          resolve(newindex);
        });
      });
    });
    var p2 = new Promise(function (resolve, reject) {
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
      resolve(filepath);
    });
    Promise.all([p1, p2]).then(function (results) {
      var list = xlsx.parse(filepath);
      total = list[0].data.length - 1;
      for (var i = 0; i < list[0].data[0].length; i++) {
        if (list[0].data[0][i] == "LISCNO") {
          LISCNOindex = i;
          if (key == 'LISCNO')
            keyindex = i;
        }
        else if (list[0].data[0][i] == "CustID") {
          CustIDindex = i;
          if (key == 'CustID')
            keyindex = i;
        }
        else if (list[0].data[0][i] == "VIN") {
          VINindex = i;
          if (key == 'VIN')
            keyindex = i;
        }
      }
      i = 1
      checkandinsert(i);
      function checkandinsert(i) {
        if (i < list[0].data.length) {
          if (list[0].data[i][keyindex] == "") {
            errornum++;
            var linenum = i + 1;
            errormsg += 'Line ' + linenum.toString() + ','
            for (var j = 0; j < list[0].data[i].length; j++) {
              if (j == list[0].data[i].length - 1)
                errormsg += list[0].data[i][j] + "<br/>";
              else
                errormsg += list[0].data[i][j] + ",";
            }
            if (i == list[0].data.length - 1) {
              var currentdate = new Date();
              var datetime = currentdate.getFullYear() + "/" + (currentdate.getMonth() + 1) + "/" + currentdate.getDate() + " "
                + currentdate.getHours() + ":"
                + currentdate.getMinutes() + ":"
                + currentdate.getSeconds();
              res.redirect("/target/ta/send/edit?successnum=" + successnum + "&errormsg=" + errormsg + "&errornum=" + errornum + "&total=" + total + "&dispaly=block&datetime=" + datetime + "&sentListID=" + newindex);
            }
            checkandinsert(i + 1);
          }
          else {
            function checkdata(mdID, callback) {
              if (key == 'LISCNO') {
                db.query("SELECT CustID_u FROM cu_LiscnoIndex where LISCNO  = '" + list[0].data[i][keyindex] + "'", function (err, recordset) {
                  if (recordset.rowsAffected == 0)
                    callback(null, "0");
                  else
                    callback(null, recordset.recordset[0].CustID_u);
                });
              }
              else if (key == 'VIN') {
                db.query("SELECT CustID_u FROM cu_LiscnoIndex where VIN  = '" + list[0].data[i][keyindex] + "'", function (err, recordset) {
                  if (recordset.rowsAffected == 0)
                    callback(null, "0");
                  else
                    callback(null, recordset.recordset[0].CustID_u);
                });
              }
              else if (key == 'CustID') {
                callback(null, list[0].data[i][keyindex]);
              }
            }
            checkdata(mdID, function (err, data1) {
              if (data1 == "0") {
                errornum++;
                var linenum = i + 1;
                errormsg += 'Line ' + linenum.toString() + ','
                for (var j = 0; j < list[0].data[i].length; j++) {
                  if (j == list[0].data[i].length - 1)
                    errormsg += list[0].data[i][j] + "\r\n";
                  else
                    errormsg += list[0].data[i][j] + ",";
                }
                if (i == list[0].data.length - 1) {
                  var currentdate = new Date();
                  var datetime = currentdate.getFullYear() + "/" + (currentdate.getMonth() + 1) + "/" + currentdate.getDate() + " "
                    + currentdate.getHours() + ":"
                    + currentdate.getMinutes() + ":"
                    + currentdate.getSeconds();
                  res.redirect("/target/ta/send/edit?successnum=" + successnum + "&errormsg=" + errormsg + "&errornum=" + errornum + "&total=" + total + "&dispaly=block&datetime=" + datetime + "&sentListID=" + newindex);
                }
                checkandinsert(i + 1);
              }
              else {
                console.log("INSERT INTO cu_SentListDet (mdID,batID,sentListID,uCustID,uLicsNO,uVIN,rptKey) values('" + mdID + "','" + batID + "'," + newindex + ",'" + list[0].data[i][CustIDindex] + "','" + list[0].data[i][LISCNOindex] + "','" + list[0].data[i][VINindex] + "','" + data1 + "')");
                db.query("INSERT INTO cu_SentListDet (mdID,batID,sentListID,uCustID,uLicsNO,uVIN,rptKey,sentListScore) values('" + mdID + "','" + batID + "'," + newindex + ",'" + list[0].data[i][CustIDindex] + "','" + list[0].data[i][LISCNOindex] + "','" + list[0].data[i][VINindex] + "','" + data1 + "',(select max(mdListScore) from md_ListDet mld where mld.mdID ='" + mdID + "' and mld.batID ='" + batID + "' and mld.mdListKey1 = '" + data1 + "'))", function (err, recordset) {
                  successnum++;
                  if (i == list[0].data.length - 1) {
                    var currentdate = new Date();
                    var datetime = currentdate.getFullYear() + "/" + (currentdate.getMonth() + 1) + "/" + currentdate.getDate() + " "
                      + currentdate.getHours() + ":"
                      + currentdate.getMinutes() + ":"
                      + currentdate.getSeconds();
                    res.redirect("/target/ta/send/edit?successnum=" + successnum + "&errormsg=" + errormsg + "&errornum=" + errornum + "&total=" + total + "&dispaly=block&datetime=" + datetime + "&sentListID=" + newindex);
                  }
                  checkandinsert(i + 1);
                });
              }
            });
          }
        }
      }
    }).catch(function (e) {
      console.log(e);
    });
  });

  router.get('/ta/send/upload/:mdID/:batID', [middleware.check(), middleware.checkEditPermission(permission.TA_DISPATCH_UPLOAD)], function (req, res) {
    var mdID = req.params.mdID || '';
    var batID = req.params.batID || '';
    var batchlist;
    var sentListCateg;
    var sentListChannel;
    var items;
    var p1 = new Promise(function (resolve, reject) {
      db.query("SELECT batID,batName FROM md_Batch where mdID ='" + mdID + "' and isClosed <> 'Y'  and isDel <> 'Y' order by updTime desc ", function (err, recordset) {
        if (err) {
          reject(err);
        }
        batchlist = recordset.recordset;
        resolve(batchlist);
      });
    });
    var p2 = new Promise(function (resolve, reject) {
      db.query("SELECT codeValue,codeLabel FROM sy_CodeTable where codeGroup = 'sentListCateg'", function (err, recordset) {
        if (err) {
          reject(err);
        }
        sentListCateg = recordset.recordset;
        resolve(sentListCateg);
      });
    });
    var p3 = new Promise(function (resolve, reject) {
      db.query("SELECT codeValue,codeLabel FROM sy_CodeTable where codeGroup = 'sentListChannel'", function (err, recordset) {
        if (err) {
          reject(err);
        }
        sentListChannel = recordset.recordset;
        resolve(sentListChannel);
      });
    });
    Promise.all([p1, p2, p3]).then(function (results) {
      db.query("SELECT mdName FROM md_Model where mdID = '" + mdID + "'", function (err, recordset) {
        var modelList = req.session.modelList;
        var navMenuList = req.session.navMenuList;
        var mgrMenuList = req.session.mgrMenuList;
        items = recordset.recordset;
        res.render('talist_putupload_add', {
          'id': req.session.userid,
          'modelInfo': items[0],
          'funcName': '投放名單上傳',
          'modelList': modelList,
          'navMenuList': navMenuList,
          'mgrMenuList': mgrMenuList,
          'batchlist': batchlist,
          'sentListCateg': sentListCateg,
          'sentListChannel': sentListChannel,
          'mdID': mdID
        });
      });
    }).catch(function (e) {
      console.log(e);
    });
  });
  router.get('/ta/send/edit', [middleware.check(), middleware.checkEditPermission(permission.TA_DISPATCH_UPLOAD)], function (req, res) {
    var mdID = decodeURI(req.query.mdID) || '';
    var batID = decodeURI(req.query.batID) || '';
    var sentListID = decodeURI(req.query.sentListID) || '';
    var errormsg = decodeURI(req.query.errormsg) || '';
    var successnum = decodeURI(req.query.successnum) || '';
    var errornum = decodeURI(req.query.errornum) || '';
    var total = decodeURI(req.query.total) || '';
    var datetime = decodeURI(req.query.datetime) || '';
    var dispaly = decodeURI(req.query.dispaly) || '';
    var sentInfo;
    db.query("SELECT cslm.mdID,cslm.batID,mm.mdName,mb.batName,sc.codeLabel sentListCateg,sct.codeLabel sentListChannel,sentListID,sentListName,sentListDesc,convert(varchar ,cslm.sentListTime,120)sentListTime,convert(varchar ,cslm.updTime,111) updTime,cslm.updUser,(select count(*) from cu_SentListDet csld where  csld.sentListID = cslm.sentListID)count FROM cu_SentListMst cslm left join md_Model mm on cslm.mdID = mm.mdID left join md_Batch mb on mb.batID = cslm.batID left join sy_CodeTable sc on sc.codeGroup ='sentListCateg' and sc.codeValue = cslm.sentListCateg left join sy_CodeTable sct on sct.codeGroup ='sentListChannel' and sct.codeValue = cslm.sentListChannel where cslm.sentListID = " + sentListID, function (err, recordset) {
      var modelList = req.session.modelList;
      var navMenuList = req.session.navMenuList;
      var mgrMenuList = req.session.mgrMenuList;
      sentInfo = recordset.recordset;
      res.render('talist_putupload_Edit', {
        'id': req.session.userid,
        'sentInfo': sentInfo,
        'funcName': '投放名單上傳',
        'modelList': modelList,
        'navMenuList': navMenuList,
        'mgrMenuList': mgrMenuList,
        'sentListID': sentListID,
        'dispaly': dispaly,
        'successnum': successnum,
        'errormsg': errormsg,
        'errornum': errornum,
        'total': total,
        'datetime': datetime
      });
    });
  });
  router.post('/ta/send/edit_act', [middleware.check(), middleware.checkEditPermission(permission.TA_DISPATCH_UPLOAD)], function (req, res) {
    var sentListID = req.body.sentListID || '';
    var sentListName = req.body.sentListName || '';
    var sentListDesc = req.body.sentListDesc || '';
    db.query("update cu_SentListMst set sentListName = '" + sentListName + "', sentListDesc = '" + sentListDesc + "'  where sentListID = " + sentListID, function (err, recordset) {
      res.redirect("/target/ta/send/edit?sentListID=" + sentListID);
    });

  });

  return router;
};