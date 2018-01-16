"use strict";
const multer = require('multer');
const winston = require('winston');
const xlsx = require("node-xlsx");
const express = require('express');
const db = require("../utils/sql-server-connector").db;
const middleware = require("../middlewares/login-check");
const constants = require("../utils/constants");
const permission = constants.menucode;
const storage = constants.ASSERTS_ABSOLUTE_PATH;
const upload = multer({ dest: storage });

module.exports = (app) => {
  console.log('[NCBSDataRoute::create] Creating NCBSData route.');
  const router = express.Router();

  router.post('/NCBS/upload_act', [middleware.check(), middleware.checkEditPermission(permission.FEED_DATA_NCBS), upload.single('uploadingFile')], function (req, res) {
    var client = req.body.client || '';
    var ncbsYear = req.body.ncbsYear || '';
    var ncbsQus = req.body.ncbsQus || '';
    var ncbsName = req.body.ncbsName || '';
    var ncbsSdt = req.body.ncbsSdt || '';
    var ncbsEdt = req.body.ncbsEdt || '';
    var ncbsDesc = req.body.ncbsDesc || '';
    var filepath = '';
    var uLicsNOindex;
    var keyIndex = 0;
    var origName = "";
    var uniqName = "";
    var anstitle = '';
    var anscontent = '';
    var canvasID = '';
    var canvasIDindex = '';
    var q4_b = '';
    var q4_b_index = '';
    var total;
    var successnum = 0;
    var errornum = 0;
    var updtime;
    var errormsg = '錯誤資訊\r\n';
    var allmsg = '';
    var modelList = req.session.modelList;
    var navMenuList = req.session.navMenuList;
    var mgrMenuList = req.session.mgrMenuList;
    var ncbsID = 0;
    var uLicsNO = '';
    var maininfo;
    var file = req.file;
    // 以下代碼得到檔案後綴
    origName = file.originalname;
    var name = file.originalname;
    var nameArray = name.split('');
    var nameMime = [];
    var l = nameArray.pop();
    nameMime.unshift(l);
    // Mime是檔案的後綴 Mime=nameMime.join('');
    // console.log(Mime); res.send("done"); //重命名檔案
    // 加上檔案後綴
    // fs.renameSync('./upload/'+file.filename,'./upload/'+file.filename+Mime);
    uniqName = file.filename;
    filepath = file.path;
    var list = xlsx.parse(filepath);
    var p1 = new Promise(function (resolve, reject) {
      total = list[0].data.length - 1;
      for (var i = 0; i < list[0].data[0].length; i++) {
        if (list[0].data[0][i] == "realid") {
          keyIndex = i;
        }
        if (list[0].data[0][i] == "CanvasID") {
          canvasIDindex = i;
        }
        if (list[0].data[0][i] == "q4_b") {
          q4_b_index = i;
        }
        if (i == list[0].data[0].length - 1)
          anstitle += list[0].data[0][i];
        else
          anstitle += list[0].data[0][i] + ",";
      }
      function insertMst(origName, uniqName, callback) {
        db.query("INSERT INTO cu_NCBSMst(ncbsName,Client,ncbsYear,ncbsDesc,ncbsQus,origName,uniqName,ncbsSdt,ncbsEdt,ncbsStruc,crtTime,updTime,updUser,funcCatge) VALUES('" + ncbsName + "','" + client + "','" + ncbsYear + "','" + ncbsDesc + "','" + ncbsQus + "','" + origName + "','" + uniqName + "','" + ncbsSdt + "','" + ncbsEdt + "','" + anstitle + "',GETDATE(),GETDATE(),'" + req.session.userid + "','NCBS')", function (err, recordset) {
          if (err)
            callback(err, null);
          else
            callback(null, 0);
        });
      }
      insertMst(origName, uniqName, function (err, data) {
        if (err) {
          console.log("ERROR : ", err);
          reject(1)
        }
        else {
          db.query("SELECT TOP 1 cnm.ncbsID,cnm.ncbsName,cnm.Client,cnm.ncbsYear,cnm.ncbsDesc,cnm.ncbsQus,convert(varchar,cnm.ncbsSdt,111)ncbsSdt,convert(varchar,cnm.ncbsEdt,111)ncbsEdt,convert(varchar,cnm.updTime,120)updTime,cnm.updUser,(select count(*) FROM cu_NCBSDet cnb where cnb.ncbsID = cnm.ncbsID)NSBCcount FROM cu_NCBSMst cnm order by ncbsID desc  ", function (err, recordset) {
            if (err)
              console.log(err);
            ncbsID = recordset.recordset[0].ncbsID;
            maininfo = recordset.recordset;
            resolve(ncbsID);
          });
        }
      });
    });

    Promise.all([p1]).then(function (results) {
      var i = 1
      checkandinsert(i);
      function checkandinsert(i) {
        if (i < list[0].data.length) {
          if (list[0].data[i][keyIndex] == "") {
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
                res.render('NCBSDataEdit', {
                  'id': req.session.userid,
                  'modelList': modelList,
                  'navMenuList': navMenuList,
                  'mgrMenuList': mgrMenuList,
                  'maininfo': maininfo,
                  'ncbsID': ncbsID,
                  'dispaly': 'block',
                  'successnum': successnum,
                  'errormsg': errormsg,
                  'errornum': errornum,
                  'total': total,
                  'datetime': datetime
                });
            }
            checkandinsert(i + 1);
          }
          else {
            const checkdata = (keyIndex, callback) => {
              db.query("SELECT CustID_u FROM cu_LiscnoIndex where LISCNO  = '" + list[0].data[i][keyIndex] + "'", function (err, recordset) {
                if (err)
                  console.log(err);
                if (recordset.rowsAffected == 0)
                  callback(null, "0");
                else
                  callback(null, recordset.recordset[0].CustID_u);
              });
            }
            checkdata(keyIndex, function (err, data1) {
              anscontent = '';
              uLicsNO = list[0].data[i][keyIndex];
              canvasID = list[0].data[i][canvasIDindex];
              for (var j = 0; j < list[0].data[i].length; j++) {
                if (j == list[0].data[i].length - 1)
                  anscontent += list[0].data[i][j];
                else
                  anscontent += list[0].data[i][j] + ",";
              }
              if (err)
                console.log("ERROR : ", err);
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
                    res.render('NCBSDataEdit', {
                      'id': req.session.userid,
                      'modelList': modelList,
                      'navMenuList': navMenuList,
                      'mgrMenuList': mgrMenuList,
                      'maininfo': maininfo,
                      'ncbsID': ncbsID,
                      'dispaly': 'block',
                      'successnum': successnum,
                      'errormsg': errormsg,
                      'errornum': errornum,
                      'total': total,
                      'datetime': datetime
                    });
                }
                checkandinsert(i + 1);
              }
              else {
                if (client == 'TOYOTA' && list[0].data[i][q4_b_index] != '5') {
                  for (var j = 0; j < list[0].data[i].length; j++) {
                    if (j == list[0].data[i].length - 1)
                      errormsg += list[0].data[i][j] + "\r\n";
                    else
                      errormsg += list[0].data[i][j] + ",";
                  }
                }
                else {
                  db.query("INSERT INTO cu_NCBSDet (ncbsID,uLicsNO,uData,uCanvas)VALUES(" + ncbsID + ",'" + uLicsNO + "','" + anscontent + "','" + canvasID + "')", function (err, recordset) {
                    if (err) {
                      console.log(err);
                    }
                    successnum++;
                    if (i == list[0].data.length - 1) {
                      var currentdate = new Date();
                      var datetime = currentdate.getFullYear() + "/" + (currentdate.getMonth() + 1) + "/" + currentdate.getDate() + " "
                        + currentdate.getHours() + ":"
                        + currentdate.getMinutes() + ":"
                        + currentdate.getSeconds();
                        res.render('NCBSDataEdit', {
                          'id': req.session.userid,
                          'modelList': modelList,
                          'navMenuList': navMenuList,
                          'mgrMenuList': mgrMenuList,
                          'maininfo': maininfo,
                          'ncbsID': ncbsID,
                          'dispaly': 'block',
                          'successnum': successnum,
                          'errormsg': errormsg,
                          'errornum': errornum,
                          'total': total,
                          'datetime': datetime
                        });
                    }
                    checkandinsert(i + 1);
                  });
                }
              }
            });

          }
        }
      }
    }).catch(function (e) {
      console.log(e);
    });
  });

  router.get('/NCBS/edit', [middleware.check(), middleware.checkEditPermission(permission.FEED_DATA_NCBS)], function (req, res) {
    var ncbsID = req.query.ncbsID || '';
    var successnum = req.query.successnum || '';
    var errormsg = req.query.errormsg || '';
    var errornum = req.query.errornum || '';
    var total = req.query.total || '';
    var dispaly = req.query.dispaly || '';
    var datetime = req.query.datetime || '';
    var modelList = req.session.modelList;
    var navMenuList = req.session.navMenuList;
    var mgrMenuList = req.session.mgrMenuList;
    var atag;
    var mtag;
    var maininfo;
    var p1 = new Promise(function (resolve, reject) {
      db.query("SELECT cnm.ncbsName,cnm.Client,cnm.ncbsYear,cnm.ncbsDesc,cnm.ncbsQus,convert(varchar,cnm.ncbsSdt,111)ncbsSdt,convert(varchar,cnm.ncbsEdt,111)ncbsEdt,convert(varchar,cnm.updTime,120)updTime,cnm.updUser,(select count(*) FROM cu_NCBSDet cnb where cnb.ncbsID = cnm.ncbsID)NSBCcount FROM cu_NCBSMst cnm where cnm.ncbsID = " + ncbsID, function (err, recordset) {
        if (err) {
          reject(err);
        }
        maininfo = recordset.recordset;
        resolve(maininfo);
      });
    });
    Promise.all([p1]).then(function (results) {
      res.render('NCBSDataEdit', {
        'id': req.session.userid,
        'modelList': modelList,
        'navMenuList': navMenuList,
        'mgrMenuList': mgrMenuList,
        'maininfo': maininfo,
        'ncbsID': ncbsID,
        'dispaly': dispaly,
        'successnum': successnum,
        'errormsg': errormsg,
        'errornum': errornum,
        'total': total,
        'datetime': datetime
      });
    }).catch(function (e) {
      console.log(e);
    });
  });

  router.get('/NCBS/upload', [middleware.check(), middleware.checkEditPermission(permission.FEED_DATA_NCBS)], function (req, res) {
    var modelList = req.session.modelList;
    var navMenuList = req.session.navMenuList;
    var mgrMenuList = req.session.mgrMenuList;
    res.render('NCBSData_upload', {
      'id': req.session.userid,
      'modelList': modelList,
      'navMenuList': navMenuList,
      'mgrMenuList': mgrMenuList,
    });
  });

  return router;
};
