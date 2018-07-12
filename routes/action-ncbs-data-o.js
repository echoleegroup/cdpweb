"use strict";
const multer = require('multer');
const winston = require('winston');
const xlsx = require("node-xlsx");
const express = require('express');
const db = require("../utils/sql-server-connector").db;
const middleware = require("../middlewares/login-check");
const constants = require("../utils/constants");
const permission = constants.MENU_CODE;
const storage = constants.ASSERTS_FOLDER_PATH_ABSOLUTE;
const upload = multer({ dest: storage });
const _connector = require('../utils/sql-query-util');
const Q = require('q');

module.exports = (app) => {
  winston.info('[NCBSDataRoute::create] Creating NCBSData route.');
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
    let oLicsNo;
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
    // winston.error(Mime); res.send("done"); //重命名檔案
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
        db.query("INSERT INTO cu_NCBSMst(ncbsName,Client,ncbsYear,ncbsDesc,ncbsQus,origName,uniqName,ncbsSdt,ncbsEdt,ncbsStruc,crtTime,updTime,updUser,funcCatge) VALUES('" + ncbsName + "','" + client + "','" + ncbsYear + "','" + ncbsDesc + "','" + ncbsQus + "','" + origName + "','" + uniqName + "','" + ncbsSdt + "','" + ncbsEdt + "','" + anstitle + "',GETDATE(),GETDATE(),'" + req.user.userId + "','NCBS')", function (err, recordset) {
          if (err)
            callback(err, null);
          else
            callback(null, 0);
        });
      }
      insertMst(origName, uniqName, function (err, data) {
        if (err) {
          winston.error("ERROR : ", err);
          reject(1)
        }
        else {
          db.query("SELECT TOP 1 cnm.ncbsID,cnm.ncbsName,cnm.Client,cnm.ncbsYear,cnm.ncbsDesc,cnm.ncbsQus,convert(varchar,cnm.ncbsSdt,111)ncbsSdt,convert(varchar,cnm.ncbsEdt,111)ncbsEdt,convert(varchar,cnm.updTime,120)updTime,cnm.updUser,(select count(*) FROM cu_NCBSDet cnb where cnb.ncbsID = cnm.ncbsID)NSBCcount FROM cu_NCBSMst cnm order by ncbsID desc  ", function (err, recordset) {
            if (err)
              winston.error(err);
            ncbsID = recordset.recordset[0].ncbsID;
            maininfo = recordset.recordset;
            resolve(ncbsID);
          });
        }
      });
    });

    Promise.all([p1]).then(function (results) {
      var i = 1
      res.redirect("/feeddata/NCBS/upload");           
      checkandinsert(i);
      function checkandinsert(i) {
        try {
          if (i < list[0].data.length) {
            if (list[0].data[i][keyIndex] == "") {
              errornum++;
              var linenum = i + 1;
              errormsg += 'Line ' + linenum.toString() + '\r\n';
              if (i == list[0].data.length - 1) {
                var currentdate = new Date();
                var datetime = currentdate.getFullYear() + "/" + (currentdate.getMonth() + 1) + "/" + currentdate.getDate() + " "
                  + currentdate.getHours() + ":"
                  + currentdate.getMinutes() + ":"
                  + currentdate.getSeconds();
                let sql = "update cu_NCBSMst set successNum = " + successnum + ",errorNum = " + errornum + ",errorMsg = '" + errormsg + "',total = " + total + " where ncbsID = " + ncbsID;
                db.query(sql, function (err, recordset) {
                  
                });
                
              }
              checkandinsert(i + 1);
            }
            else {
              const checkdata = (keyIndex, callback) => {
                db.query("SELECT CustID_u,LICSNO FROM cu_LicsnoIndex where REPLACE(LICSNO,'-','')  = '" + list[0].data[i][keyIndex].toString().replace("-", "") + "'", function (err, recordset) {
                  if (err)
                    winston.error(err);
                  if (recordset.rowsAffected == 0)
                    callback(null, "0");
                  else {
                    uLicsNO = recordset.recordset[0].LICSNO;
                    callback(null, recordset.recordset[0].CustID_u);
                  }
                });
              }
              checkdata(keyIndex, function (err, data1) {
                anscontent = '';
                canvasID = list[0].data[i][canvasIDindex];
                for (var j = 0; j < list[0].data[i].length; j++) {
                  if (j == list[0].data[i].length - 1)
                    anscontent += list[0].data[i][j];
                  else
                    anscontent += list[0].data[i][j] + ",";
                }
                if (err)
                  winston.error("ERROR : ", err);
                if (data1 == "0") {
                  errornum++;
                  var linenum = i + 1;
                  errormsg += 'Line ' + linenum.toString() + '\r\n';

                  if (i == list[0].data.length - 1) {
                    var currentdate = new Date();
                    var datetime = currentdate.getFullYear() + "/" + (currentdate.getMonth() + 1) + "/" + currentdate.getDate() + " "
                      + currentdate.getHours() + ":"
                      + currentdate.getMinutes() + ":"
                      + currentdate.getSeconds();
                    let sql = "update cu_NCBSMst set successNum = " + successnum + ",errorNum = " + errornum + ",errorMsg = '" + errormsg + "',total = " + total + " where ncbsID = " + ncbsID;
                    db.query(sql, function (err, recordset) {
                     
                    });
                   
                  }
                  else {
                    checkandinsert(i + 1);
                  }
                }
                else {
                  if (client == 'TOYOTA' && list[0].data[i][q4_b_index] != '5') {
                    errormsg += 'Line ' + linenum.toString() + '\r\n';
                    if (i == list[0].data.length - 1) {
                      var currentdate = new Date();
                      var datetime = currentdate.getFullYear() + "/" + (currentdate.getMonth() + 1) + "/" + currentdate.getDate() + " "
                        + currentdate.getHours() + ":"
                        + currentdate.getMinutes() + ":"
                        + currentdate.getSeconds();
                      let sql = "update cu_NCBSMst set successNum = " + successnum + ",errorNum = " + errornum + ",errorMsg = '" + errormsg + "',total = " + total + " where ncbsID = " + ncbsID;
                      db.query(sql, function (err, recordset) {
                       
                      });
                      
                    }
                    else
                      checkandinsert(i + 1);
                  }
                  else {
                    db.query("INSERT INTO cu_NCBSDet (ncbsID,uLicsNO,uData,uCanvas)VALUES(" + ncbsID + ",'" + uLicsNO + "','" + anscontent + "','" + canvasID + "')", function (err, recordset) {
                      if (err) {
                        winston.error(err);
                      }
                      successnum++;
                      if (i == list[0].data.length - 1) {
                        var currentdate = new Date();
                        var datetime = currentdate.getFullYear() + "/" + (currentdate.getMonth() + 1) + "/" + currentdate.getDate() + " "
                          + currentdate.getHours() + ":"
                          + currentdate.getMinutes() + ":"
                          + currentdate.getSeconds();
                        let sql = "update cu_NCBSMst set successNum = " + successnum + ",errorNum = " + errornum + ",errorMsg = '" + errormsg + "',total = " + total + " where ncbsID = " + ncbsID;
                        db.query(sql, function (err, recordset) {
                         
                        });
                        
                      }
                      else
                        checkandinsert(i + 1);
                    });
                  }
                }
              });

            }
          }
        } catch (error) {
          winston.error(error);
        }
      }

    }).catch(function (e) {
      winston.error(e);
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
      db.query("SELECT cnm.ncbsName,cnm.Client,cnm.ncbsYear,cnm.ncbsDesc,cnm.ncbsQus,convert(varchar,cnm.ncbsSdt,111)ncbsSdt,convert(varchar,cnm.ncbsEdt,111)ncbsEdt,convert(varchar,cnm.updTime,120)updTime,cnm.updUser,(select count(*) FROM cu_NCBSDet cnb where cnb.ncbsID = cnm.ncbsID)NSBCcount,cnm.successNum,cnm.errorNum,cnm.errorMsg,cnm.total FROM cu_NCBSMst cnm where cnm.ncbsID = " + ncbsID, function (err, recordset) {
        if (err) {
          reject(err);
        }
        maininfo = recordset.recordset;
        resolve(maininfo);
      });
    });
    Promise.all([p1]).then(function (results) {
      res.render('NCBSDataEdit', {
        'user': req.user,
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
      winston.error(e);
    });
  });

  router.get('/NCBS/upload', [middleware.check(), middleware.checkEditPermission(permission.FEED_DATA_NCBS)], function (req, res) {
    var modelList = req.session.modelList;
    var navMenuList = req.session.navMenuList;
    var mgrMenuList = req.session.mgrMenuList;
    let sql = "select ncbsDesc from cu_NCBSQus";
    let request = _connector.queryRequest();
    Q.nfcall(request.executeQuery, sql).then((resultSet) => {
      res.render('NCBSData_upload', {
        'user': req.user,
        'modelList': modelList,
        'navMenuList': navMenuList,
        'mgrMenuList': mgrMenuList,
        'ncbsDesc': resultSet
      });
    });
  });

  return router;
};
