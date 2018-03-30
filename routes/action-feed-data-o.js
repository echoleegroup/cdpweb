"use strict";
const express = require('express');
const multer = require('multer');
const winston = require('winston');
const xlsx = require("node-xlsx");
const db = require("../utils/sql-server-connector").db;
const middleware = require("../middlewares/login-check");
const downloadService = require('../services/download-service');
const constants = require("../utils/constants");
const permission = constants.MENU_CODE;
const storage = constants.ASSERTS_FOLDER_PATH_ABSOLUTE;
const upload = multer({ dest: storage });
const _connector = require('../utils/sql-query-util');
const Q = require('q');

module.exports = (app) => {
  console.log('[FeedDataRoute::create] Creating FeedData route.');
  const router = express.Router();

  router.get('/search', [middleware.check(), middleware.checkViewPermission(permission.FEED_DATA_LIST)], function (req, res) {
    var funcCatge;
    var modelList = req.session.modelList;
    var navMenuList = req.session.navMenuList;
    var mgrMenuList = req.session.mgrMenuList;
    var p1 = new Promise(function (resolve, reject) {
      db.query("SELECT codeValue,codeLabel FROM sy_CodeTable where codeGroup = 'funcCatgeForFeedData' order by codeValue desc ", function (err, recordset) {
        if (err) {
          console.log(err);
          reject(2);
        }
        funcCatge = recordset.recordset;
        resolve(1);
      });
    });
    Promise.all([p1]).then(function (results) {
      res.render('FeedDataSearch', {
        'user': req.user,
        'modelList': modelList,
        'navMenuList': navMenuList,
        'mgrMenuList': mgrMenuList,
        'funcCatge': funcCatge
      });
    }).catch(function (e) {
      console.log(e);
    });


  });

  router.get('/download', [middleware.check(), middleware.checkDownloadPermission(permission.FEED_DATA_LIST)], function (req, res) {
    var listid = req.query.ListID || '';
    var datasource = req.query.datasource || '';
    downloadService.getFilePath(listid, datasource, function (err, result) {
      res.setHeader('Content-Type', 'application/vnd.openxmlformats');
      res.setHeader("Content-Disposition", "attachment; filename=" + result.origName)
      res.sendFile(storage + result.uniqName);
    });
  });

  router.post('/list', [middleware.check(), middleware.checkDownloadPermission(permission.FEED_DATA_LIST)], function (req, res) {
    var modelList = req.session.modelList;
    var navMenuList = req.session.navMenuList;
    var mgrMenuList = req.session.mgrMenuList;
    var client = req.body.client || '';
    var funcCatge = req.body.funcCatge || '';
    var ListSdt = req.body.ListSdt || '';
    var ListEdt = req.body.ListEdt || '';
    var ListName = req.body.ListName || '';
    var tagwhere = " where 1 = 1";
    var FeedDataSql = "SELECT colm.outerListID as ListID,colm.outerListName as ListName,colm.Client as Client,colm.funcCatge as funcCatge,sc.codeLabel as funcCatgeName,colm.outerListDesc as ListDesc,colm.origName as origName,colm.uniqName as uniqName,colm.fileRepos as fileRepos,convert(varchar, colm.outerListSdt, 111) as ListSdt,convert(varchar, colm.outerListEdt, 111) as ListEdt,colm.isDel as isDel,convert(varchar, colm.updTime, 120) as updTime,colm.updUser as updUser,(select count(*) FROM cu_OuterListDet cold where cold.outerListID = colm.outerListID ) as detcount FROM cu_OuterListMst colm left join sy_CodeTable sc on sc.codeGroup = 'funcCatgeForFeedData' and colm.funcCatge = sc.codeValue  where 1 = 1 ";
    var NCBSsql = "SELECT cbm.ncbsID as ListID,cbm.ncbsName as ListName,cbm.Client as Client,cbm.funcCatge as funcCatge,sc.codeLabel as funcCatgeName,cbm.ncbsDesc  as ListDesc,cbm.origName as origName,cbm.uniqName as uniqName,cbm.fileRepos as fileRepos,convert(varchar,cbm.ncbsSdt, 111) as ListSdt,convert(varchar,cbm.ncbsEdt, 111) as ListEdt,cbm.isDel as isDel,convert(varchar,cbm.updTime, 120) as updTime,cbm.updUser as updTime,(select count(*) FROM cu_NCBSDet cnd where cnd.ncbsID = cbm.ncbsID ) as detcount FROM cu_NCBSMst cbm left join sy_CodeTable sc on sc.codeGroup = 'funcCatgeForFeedData' and cbm.funcCatge = sc.codeValue where 1 = 1 ";
    if (client != '') {
      tagwhere += " and colm.Client = '" + client + "' ";
      FeedDataSql += " and colm.Client = '" + client + "' ";
      NCBSsql += " and cbm.Client = '" + client + "' ";
    }
    if (funcCatge != '') {
      tagwhere += " and colm.funcCatge = '" + funcCatge + "' ";
      FeedDataSql += " and colm.funcCatge = '" + funcCatge + "' ";
      NCBSsql += " and cbm.funcCatge = '" + funcCatge + "' ";
    }
    if (ListSdt != '') {
      tagwhere += " and colm.outerListSdt >= '" + ListSdt + " 00:00:00' ";
      FeedDataSql += " and colm.outerListSdt >= '" + ListSdt + " 00:00:00' ";
      NCBSsql += " and cbm.ncbsSdt >= '" + ListSdt + " 00:00:00' ";
    }
    if (ListEdt != '') {
      tagwhere += " and colm.outerListEdt <= '" + ListEdt + " 23:59:59' ";
      FeedDataSql += " and colm.outerListEdt <= '" + ListEdt + " 23:59:59'  ";
      NCBSsql += " and cbm.ncbsSdt <= '" + ListEdt + " 23:59:59' ";
    }
    if (ListName != '') {
      tagwhere += " and colm.outerListName like '%" + ListName + "%' ";
      FeedDataSql += " and colm.outerListName like '%" + ListName + "%' ";
      NCBSsql += " and cbm.ncbsName like '%" + ListName + "%' ";
    }
    var unionSql = FeedDataSql + " union " + NCBSsql + " order by ListSdt desc ";
    var data = [];
    var taginfo = [];
    var feeddatalist = [];
    var feeddata = [];
    var p1 = new Promise(function (resolve, reject) {
      db.query(unionSql, function (err, recordset) {
        if (err) {
          reject(err);
        }
        for (var i = 0; i < recordset.rowsAffected; i++) {
          feeddata = [];
          feeddata.push({
            no: i + 1,
            ListID: recordset.recordset[i].ListID,
            ListName: recordset.recordset[i].ListName,
            Client: recordset.recordset[i].Client,
            funcCatge: recordset.recordset[i].funcCatge,
            funcCatgeName: recordset.recordset[i].funcCatgeName,
            ListDesc: recordset.recordset[i].ListDesc,
            origName: recordset.recordset[i].origName,
            uniqName: recordset.recordset[i].uniqName,
            fileRepos: recordset.recordset[i].fileRepos,
            ListSdt: recordset.recordset[i].ListSdt,
            ListEdt: recordset.recordset[i].ListEdt,
            isDel: recordset.recordset[i].isDel,
            updTime: recordset.recordset[i].updTime,
            updUser: recordset.recordset[i].updUser,
            detcount: recordset.recordset[i].detcount

          });
          feeddatalist.push({
            feeddata: feeddata
          });
        }

        resolve(feeddatalist);
      });
    });
    Promise.all([p1]).then(function (results) {
      db.query("SELECT cult.* FROM cu_OuterListTag cult where cult.outerListID in (select outerListID from cu_OuterListMst colm " + tagwhere + " )", function (err, recordset) {
        for (var i = 0; i < feeddatalist.length; i++) {
          taginfo = [];
          for (var j = 0; j < recordset.rowsAffected; j++) {
            if (feeddatalist[i].feeddata[0].ListID == recordset.recordset[j].outerListID && feeddatalist[i].feeddata[0].funcCatge != "NCBS") {
              taginfo.push({
                tag: recordset.recordset[j].tagLabel,
                tagID: recordset.recordset[j].tagID
              });
            }

          }
          feeddatalist[i].feeddata.push({
            taginfo: taginfo
          });
        }
        res.render('feeddataList', {
          'user': req.user,
          'modelList': modelList,
          'navMenuList': navMenuList,
          'mgrMenuList': mgrMenuList,
          'feeddatalist': JSON.stringify(feeddatalist)
        });
      });
    }).catch(function (e) {
      console.log(e);
    });
  });

  router.post('/outdata/upload_act', [middleware.check(), middleware.checkEditPermission(permission.FEED_DATA_OUT), upload.single('uploadingFile')], function (req, res) {
    let client = req.body.client || '';
    let optradio = req.body.optradio || '';
    let outerListName = req.body.outerListName || '';
    let funcCatge = req.body.funcCatge || '';
    let outerListSdt = req.body.outerListSdt || '';
    let outerListEdt = req.body.outerListEdt || '';
    let outerListDesc = req.body.outerListDesc || '';
    let filepath = '';
    let uNameindex, uCustIDindex, uLicsNOindex, uTelindex, uMailindex, uAddindex, uAtNameindex, uAtTelindex, uAtMailindex, uAtAddindex;
    let keyIndex = -1;
    let origName = "";
    let uniqName = "";
    let total;
    let successnum = 0;
    let errornum = 0;
    let updtime;
    let errormsg = '錯誤資訊\r\n';
    let allmsg = '';
    let outerListID = 0;
    let file = req.file;
    // 以下代碼得到檔案後綴
    origName = file.originalname;
    let name = file.originalname;
    let nameArray = name.split('');
    let nameMime = [];
    let l = nameArray.pop();
    nameMime.unshift(l);
    // Mime是檔案的後綴 Mime=nameMime.join('');
    // console.log(Mime); res.send("done"); //重命名檔案
    // 加上檔案後綴
    // fs.renameSync('./upload/'+file.filename,'./upload/'+file.filename+Mime);
    uniqName = file.filename;
    filepath = file.path;
    let list = xlsx.parse(filepath);
    let p1 = new Promise(function (resolve, reject) {
      total = list[0].data.length - 1;
      function insertMst(origName, uniqName, callback) {
        db.query("INSERT INTO cu_OuterListMst(outerListName,Client,funcCatge,outerListDesc,origName,uniqName,outerListSdt,outerListEdt,updTime,updUser)VALUES('" + outerListName + "','" + client + "','" + funcCatge + "','" + outerListDesc + "','" + origName + "','" + uniqName + "','" + outerListSdt + "','" + outerListEdt + "',GETDATE(),'" + req.user.userId + "') ", function (err, recordset) {
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
          db.query("SELECT TOP 1 outerListID FROM cu_OuterListMst order by outerListID desc  ", function (err, recordset) {
            if (err)
              console.log(err);
            outerListID = recordset.recordset[0].outerListID;
            resolve(2);
          });
        }
      });
    });
    Promise.all([p1]).then(function (results) {
      for (var i = 0; i < list[0].data[0].length; i++) {
        if (list[0].data[0][i] == "車主姓名") {
          uNameindex = i;

        }
        else if (list[0].data[0][i] == "身份證字號") {
          uCustIDindex = i;

        }
        else if (list[0].data[0][i] == "車牌") {
          uLicsNOindex = i;
        }
        else if (list[0].data[0][i] == "連絡電話") {
          uTelindex = i;
        }
        else if (list[0].data[0][i] == "電子郵件") {
          uMailindex = i;
        }
        else if (list[0].data[0][i] == "地址") {
          uAddindex = i;
        }
        else if (list[0].data[0][i] == "報名人姓名") {
          uAtNameindex = i;
        }
        else if (list[0].data[0][i] == "報名人電話") {
          uAtTelindex = i;
        }
        else if (list[0].data[0][i] == "報名人電子郵件") {
          uAtMailindex = i;
        }
        else if (list[0].data[0][i] == "報名人地址") {
          uAtAddindex = i;
        }
        if (optradio == "uCustID")
          keyIndex = uCustIDindex;
        else if (optradio == "uLiscNO")
          keyIndex = uLicsNOindex;
        else
          keyIndex = uTelindex;
      }
      i = 1
      checkandinsert(i);
      function checkandinsert(i) {
        if (i < list[0].data.length) {
          if (keyIndex === -1 || keyIndex == undefined) {
            errornum++;
            var linenum = i + 1;
            errormsg += 'Line ' + linenum.toString() + ','
            if (optradio == "uCustID")
              errormsg += '無法找到身份證字號欄位\r\n';
            else if (optradio == "uLiscNO")
              errormsg += '無法找到車牌欄位\r\n';
            else
              errormsg += '無法找到手機欄位\r\n';
            for (var j = 0; j < list[0].data[i].length; j++) {
              if (j == list[0].data[i].length - 1)
                errormsg += list[0].data[i][j] + "\r\n";
              else
                errormsg += list[0].data[i][j] + ",";
            }
            if (i == list[0].data.length - 1) {
              if (total == errornum) {
                db.query("delete from cu_OuterListMst where outerListID = " + outerListID, function (err, recordset) {
                  var currentdate = new Date();
                  var datetime = currentdate.getFullYear() + "/" + (currentdate.getMonth() + 1) + "/" + currentdate.getDate() + " "
                    + currentdate.getHours() + ":"
                    + currentdate.getMinutes() + ":"
                    + currentdate.getSeconds();
                  res.redirect("/feeddata/outdata/edit?outerListID=" + outerListID + "&successnum=" + successnum + "&errormsg=" + errormsg + "&errornum=" + errornum + "&total=" + total + "&dispaly=block&datetime=" + datetime);
                });
              }
              else {
                var currentdate = new Date();
                var datetime = currentdate.getFullYear() + "/" + (currentdate.getMonth() + 1) + "/" + currentdate.getDate() + " "
                  + currentdate.getHours() + ":"
                  + currentdate.getMinutes() + ":"
                  + currentdate.getSeconds();
                res.redirect("/feeddata/outdata/edit?outerListID=" + outerListID + "&successnum=" + successnum + "&errormsg=" + errormsg + "&errornum=" + errornum + "&total=" + total + "&dispaly=block&datetime=" + datetime);
              }
            }
            checkandinsert(i + 1);
          }
          else if (list[0].data[i][keyIndex] == undefined) {
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
              if (total == errornum) {
                db.query("delete from cu_OuterListMst where outerListID = " + outerListID, function (err, recordset) {
                  var currentdate = new Date();
                  var datetime = currentdate.getFullYear() + "/" + (currentdate.getMonth() + 1) + "/" + currentdate.getDate() + " "
                    + currentdate.getHours() + ":"
                    + currentdate.getMinutes() + ":"
                    + currentdate.getSeconds();
                  res.redirect("/feeddata/outdata/edit?outerListID=" + outerListID + "&successnum=" + successnum + "&errormsg=" + errormsg + "&errornum=" + errornum + "&total=" + total + "&dispaly=block&datetime=" + datetime);
                });
              }
              else {
                var currentdate = new Date();
                var datetime = currentdate.getFullYear() + "/" + (currentdate.getMonth() + 1) + "/" + currentdate.getDate() + " "
                  + currentdate.getHours() + ":"
                  + currentdate.getMinutes() + ":"
                  + currentdate.getSeconds();
                res.redirect("/feeddata/outdata/edit?outerListID=" + outerListID + "&successnum=" + successnum + "&errormsg=" + errormsg + "&errornum=" + errornum + "&total=" + total + "&dispaly=block&datetime=" + datetime);
              }
            }
            checkandinsert(i + 1);
          }
          else {
            let CustIDValue = (list[0].data[i][uCustIDindex] != undefined) 
            ? list[0].data[i][uCustIDindex].toString().toUpperCase() : null;
            let LicsNOValue = ( list[0].data[i][uLicsNOindex] != undefined) 
            ? list[0].data[i][uLicsNOindex].toString().toUpperCase() : null;

            db.query("INSERT INTO cu_OuterListDet (outerListID,uName,uCustID,uLicsNO,uTel,uMail,uAdd,uAtName,uAtTel,uAtMail,uAtAdd)"
              + " VALUES(" + outerListID + ",'" + list[0].data[i][uNameindex] + "','" + CustIDValue + "','" + LicsNOValue + "','" + list[0].data[i][uTelindex] + "','" + list[0].data[i][uMailindex] + "','" + list[0].data[i][uAddindex] + "','" + list[0].data[i][uAtNameindex] + "','" + list[0].data[i][uAtTelindex] + "','" + list[0].data[i][uAtMailindex] + "','" + list[0].data[i][uAtAddindex] + "')", function (err, recordset) {
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
                  res.redirect("/feeddata/outdata/edit?outerListID=" + outerListID + "&successnum=" + successnum + "&errormsg=" + errormsg + "&errornum=" + errornum + "&total=" + total + "&dispaly=block&datetime=" + datetime);
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

  router.get('/outdata/edit', [middleware.check(), middleware.checkEditPermission(permission.FEED_DATA_OUT)], function (req, res) {
    let outerListID = req.query.outerListID || '';
    let successnum = req.query.successnum || '';
    let errormsg = req.query.errormsg || '';
    let errornum = req.query.errornum || '';
    let total = req.query.total || '';
    let dispaly = req.query.dispaly || '';
    let datetime = req.query.datetime || '';
    let funcCatge;
    let modelList = req.session.modelList;
    let navMenuList = req.session.navMenuList;
    let mgrMenuList = req.session.mgrMenuList;
    let atag;
    let mtag;
    let maininfo;
    let p1 = new Promise(function (resolve, reject) {
      db.query("SELECT colm.outerListName,colm.Client,colm.funcCatge,sc.codeLabel,colm.outerListDesc,convert(varchar,colm.outerListSdt,111)outerListSdt,convert(varchar,colm.outerListEdt,111)outerListEdt,colm.isDel,convert(varchar,colm.updTime,111)updTime,colm.updUser,(select count(*) from cu_OuterListDet cold where cold.outerListID = colm.outerListID)total FROM cu_OuterListMst colm left join sy_CodeTable sc on sc.codeGroup = 'funcCatge' and sc.codeValue = colm.funcCatge where outerListID = " + outerListID, function (err, recordset) {
        if (err) {
          reject(err);
        }
        maininfo = recordset.recordset;
        resolve(maininfo);
      });
    });
    let p2 = new Promise(function (resolve, reject) {
      db.query("SELECT codeValue,codeLabel FROM sy_CodeTable where codeGroup = 'funcCatgeForFeedData' order by codeValue desc ", function (err, recordset) {
        if (err) {
          reject(err);
        }
        funcCatge = recordset.recordset;
        resolve(funcCatge);
      });
    });
    Promise.all([p1, p2]).then(function (results) {
      res.render('FeedDataEdit', {
        'user': req.user,
        'modelList': modelList,
        'navMenuList': navMenuList,
        'mgrMenuList': mgrMenuList,
        'maininfo': maininfo,
        'funcCatge': funcCatge,
        'outerListID': outerListID,
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

  router.post('/outdata/edit_act', [middleware.check(), middleware.checkEditPermission(permission.FEED_DATA_OUT)], function (req, res) {
    let outerListID = req.body.outerListID || '';
    let outerListName = req.body.outerListName || '';
    let funcCatge = req.body.funcCatge || '';
    let outerListSdt = req.body.outerListSdt + " 00:00:00" || '';
    let outerListEdt = req.body.outerListEdt + " 23:59:59" || '';
    let outerListDesc = req.body.outerListDesc || '';
    let sql = "UPDATE cu_OuterListMst set outerListName = @outerListName, funcCatge = @funcCatge, outerListSdt = @outerListSdt, " +
      "outerListEdt = @outerListEdt, outerListDesc = @outerListDesc, updTime = GETDATE(), updUser = @userID " +
      " WHERE outerListID = @outerListID";
    let request = _connector.queryRequest()
      .setInput('outerListName', _connector.TYPES.NVarChar, outerListName)
      .setInput('funcCatge', _connector.TYPES.NVarChar, funcCatge)
      .setInput('outerListSdt', _connector.TYPES.NVarChar, outerListSdt)
      .setInput('outerListEdt', _connector.TYPES.NVarChar, outerListEdt)
      .setInput('outerListDesc', _connector.TYPES.NVarChar, outerListDesc)
      .setInput('userID', _connector.TYPES.NVarChar, req.user.userId)
      .setInput('outerListID', _connector.TYPES.Int, outerListID);
    Q.nfcall(request.executeQuery, sql).then((resultSet) => {
      res.redirect("/feeddata/outdata/edit?outerListID=" + outerListID);
    }).fail((err) => {
      winston.error('====[modelUpload] query modelUpload failed: ', err);
      res.send(err);
    });

  });

  router.get('/outdata/upload', [middleware.check(), middleware.checkEditPermission(permission.FEED_DATA_OUT)], function (req, res) {
    var funcCatge;
    var adcount = 0;
    var updUser, updTime;
    var modelList = req.session.modelList;
    var navMenuList = req.session.navMenuList;
    var mgrMenuList = req.session.mgrMenuList;
    var p1 = new Promise(function (resolve, reject) {
      db.query("SELECT codeValue,codeLabel FROM sy_CodeTable where codeGroup = 'funcCatge' order by codeValue desc ", function (err, recordset) {
        if (err) {
          reject(err);
        }
        funcCatge = recordset.recordset;
        resolve(funcCatge);
      });
    });
    Promise.all([p1]).then(function (results) {
      res.render('FeedData_upload', {
        'user': req.user,
        'modelList': modelList,
        'navMenuList': navMenuList,
        'mgrMenuList': mgrMenuList,
        'funcCatge': funcCatge
      });
    }).catch(function (e) {
      console.log(e);
    });
  });

  router.post('/outdata/tag/add', function (req, res) {
    var ListID = req.body.ListID;
    var newtag = req.body.newtag;
    var issame = '';
    var tagID;
    newtag = newtag.trim();
    var p1 = new Promise(function (resolve, reject) {
      db.query("SELECT outerListID FROM cu_OuterListTag where outerListID=" + ListID + " and tagLabel ='" + newtag + "' ", function (err, recordset) {
        if (err) {
          console.log(err);
          reject(2);
        }
        if (recordset.rowsAffected != 0)
          issame = 'Y';
        else
          issame = 'N';
        resolve(issame);
      });
    });
    Promise.all([p1]).then(function (results) {
      if (issame == 'Y')
        res.end("已新增過");
      else {
        const addtag = (ListID, newtag, callback) => {
          db.query("INSERT INTO cu_OuterListTag(outerListID,tagLabel,updTime,updUser) VALUES(" + ListID + ",'" + newtag + "',GETDATE(),'" + req.user.userId + "') ", function (err, recordset) {
            if (err)
              callback(err, null);
            else
              callback(null, 0);
          });
        }
        addtag(ListID, newtag, function (err, data) {
          if (err)
            console.log("ERROR : ", err);
          else {
            db.query("SELECT TOP 1 tagID FROM cu_OuterListTag where outerListID =" + ListID + " order by tagID desc  ", function (err, recordset) {
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

  router.post('/outdata/tag/del', function (req, res) {
    var ListID = req.body.ListID;
    var tagID = req.body.tagID;
    db.query("UPDATE cu_OuterListTag set isDel = 'Y' where outerListID = " + ListID + " and tagID =  " + tagID, function (err, recordset) {
      if (err) console.log(err);
      res.end('刪除成功');
    });
  });

  return router;
};