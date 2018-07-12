"use strict";
const express = require('express');
const winston = require('winston');
const shortid = require('shortid');
const middleware = require("../middlewares/login-check");
const permission = require("../utils/constants").MENU_CODE;
const db = require("../utils/sql-server-connector").db;
const _connector = require('../utils/sql-query-util');
const Q = require('q');
const mail_util = require("../utils/mail-util");
module.exports = (app) => {
  winston.info('[userRoute::create] Creating user route.');
  const router = express.Router();


  router.post('/user/add/checkID', function (req, res) {
    var userId = req.body.userId || '';
    db.query("select count(*) total from sy_infouser where userId = '" + userId + "'", function (err, recordset) {
      if (err) winston.error(err);
      //send records as a response
      if (recordset.recordset[0].total == 0)
        res.end("ok");
      else
        res.end("same");

    });
  });

  router.get('/user/add', [middleware.check(), middleware.checkEditPermission(permission.USER)], function (req, res) {
    var modelList = req.session.modelList;
    var navMenuList = req.session.navMenuList;
    var mgrMenuList = req.session.mgrMenuList;
    res.render('userAdd', {
      'user': req.user,
      'ugrpClass': '',
      'modelList': modelList,
      'navMenuList': navMenuList,
      'mgrMenuList': mgrMenuList
    });
  });

  router.post('/user/add_act', [middleware.check(), middleware.checkEditPermission(permission.USER)], function (req, res) {
    var userId = req.body.userId || '';
    var username = req.body.username || '';
    var email = req.body.email || '';
    var bookmark = req.body.bookmark || '';
    var isstop = req.body.isstop || '';
    var checked = 'N';
    if (isstop == 'on')
      checked = 'Y';
    db.query("insert into sy_infouser(userId,password,userName,email,modifyTime,createdDate,bookmark,modifyName,isstop) values('" + userId + "','test','" + username + "','" + email + "',GETDATE(),GETDATE(),'" + bookmark + "','" + req.user.userId + "','" + checked + "')", function (err, recordset) {
      if (err) winston.error(err);
      let sendInfo = {
        "subject": "和泰大數據平台-帳號啟用通知",
        "content": `親愛的使用者<br/>：您的帳號已經建立啟用，請至 <a href="http://${process.env.HOST}:${process.env.PORT}">和泰大數據平台</a> 登入系統並進行密碼變更，謝謝。<br/>帳號：${userId}<br/>預設密碼：test`
      }
      mail_util.htmlMail(email, sendInfo, function (err, result) {
        if (err) {
          winston.error('===adduser failed:', err);
        }
        res.redirect('/system/user/edit?userId=' + userId);
      });
    });

  });

  router.get('/user/search', [middleware.check(), middleware.checkViewPermission(permission.USER)], function (req, res) {
    db.query('select * from sy_ugrpClass', function (err, recordset) {
      var modelList = req.session.modelList;
      var navMenuList = req.session.navMenuList;
      var mgrMenuList = req.session.mgrMenuList;
      res.render('userSearch', {
        'user': req.user,
        'ugrpClass': recordset.recordset,
        'modelList': modelList,
        'navMenuList': navMenuList,
        'mgrMenuList': mgrMenuList
      });
    });
  });

  router.post('/user/list', [middleware.check(), middleware.checkViewPermission(permission.USER)], function (req, res) {
    var userId = req.body.userId || '';
    var username = req.body.username || '';
    var ugrpClass = req.body.ugrpClass || '';
    var sregdate = req.body.sregdate || '';
    var eregdate = req.body.eregdate || '';
    var slogindate = req.body.slogindate || '';
    var elogindate = req.body.elogindate || '';
    var sql = '';
    var where = '';
    if (ugrpClass != '') {
      sql += "select  distinct si.userId, ROW_NUMBER() OVER (ORDER BY si.userId ASC) as no, si.username,si.bookmark,convert(varchar, si.loginTime, 120)loginTime,si.isstop from sy_infouser si,sy_userWithUgrp suw";
      where += " where suw.userId = si.userId ";
    }
    else {
      sql += "select distinct si.userId, ROW_NUMBER() OVER (ORDER BY si.userId ASC) as no, si.username,si.bookmark,convert(varchar, si.loginTime, 120)loginTime,si.isstop from sy_infouser si";
      where += " where 1 = 1 ";
    }

    if (userId != '')
      where += " and si.userId like '%" + userId + "%' ";
    if (username != '')
      where += " and si.username like '%" + username + "%' ";
    if (ugrpClass != '')
      where += " and suw.ugrpId = '" + ugrpClass + "' ";
    if (sregdate != '')
      where += " and si.createdDate >= '" + sregdate + " 00:00:00' ";
    if (eregdate != '')
      where += " and si.createdDate <= '" + eregdate + " 23:59:59' ";
    if (slogindate != '')
      where += " and si.loginTime >= '" + slogindate + " 00:00:00' ";
    if (eregdate != '')
      where += " and si.loginTime <= '" + eregdate + " 23:59:59' ";
    db.query(sql + where, function (err, recordset) {
      var modelList = req.session.modelList;
      var navMenuList = req.session.navMenuList;
      var mgrMenuList = req.session.mgrMenuList;
      res.render('userList', {
        'user': req.user,
        'items': recordset.recordset,
        'modelList': modelList,
        'navMenuList': navMenuList,
        'mgrMenuList': mgrMenuList
      });
    });
  });

  router.post('/user/role/del', function (req, res) {
    var ugrpId = req.body.ugrpId || '';
    var userId = req.body.userId || '';
    db.query("delete from sy_userWithUgrp where userId ='" + userId + "' and ugrpId = " + ugrpId, function (err, recordset) {
      if (err) winston.error(err);
      //send records as a response
      res.end('ok');

    });
  });

  router.post('/user/role/add', function (req, res) {
    var ucid = req.body.ucid || '';
    var userId = req.body.userId || '';
    function addugrpId(ucid, userId, callback) {
      var where = " where userId = '" + userId + "' and ugrpId =" + ucid;
      db.query('select count(*) total from sy_userWithUgrp' + where, function (err, recordset) {
        if (err)
          callback(err, null);
        else
          callback(null, recordset.recordset[0].total);
      });
    }
    addugrpId(ucid, userId, function (err, data) {
      if (err)
        winston.info("ERROR : ", err);
      else if (data != 0)
        res.end('已新增過');
      else {
        db.query("insert into sy_userWithUgrp(userId,ugrpId,modifyDate,modifyName) VALUES('" + userId + "'," + ucid + ",GETDATE(),'" + req.user.userId + "') ", function (err, recordset) {
          if (err) winston.error(err);
          //send records as a response
          res.end('新增完成');
        });
      }
    });
  });

  router.post('/user/edit_act', [middleware.check(), middleware.checkEditPermission(permission.USER)], function (req, res) {
    var userId = req.body.userId || '';
    var username = req.body.username || '';
    var email = req.body.email || '';
    var bookmark = req.body.bookmark || '';
    var isstop = req.body.isstop || '';
    var password = req.body.pwd || '';
    var checked = 'N';
    if (isstop === 'on')
      checked = 'Y';
    var where = " where userId ='" + userId + "'";
    db.query("update sy_infouser set  username = '" + username + "',password = '" + password + "', email = '" + email + "', bookmark='" + bookmark + "',modifyName ='" + req.user.userId + "',modifyTime=GETDATE(), isstop = '" + checked + "' " + where, function (err, recordset) {
      if (err) winston.error(err);
      //send records as a response
      res.redirect('/system/user/edit?userId=' + userId);
    });
  });

  router.get('/user/edit', [middleware.check(), middleware.checkViewPermission(permission.USER)], function (req, res) {
    var userId = req.query.userId || '';
    var where = " where userId ='" + userId + "'";
    var ugrpClass, userRole, items;
    var checked;
    var ugrpClassName = '';
    var aduglist = [];
    var adug = [];
    var p1 = new Promise(function (resolve, reject) {
      db.query('SELECT u.ugrpId,u.ugrpClass,u.ugrpName,u.remark,u.regdate,convert(varchar, u.modifyDate, 120)modifyDate,u.signer,u.isStop,uc.ugrpClassName FROM sy_ugrp u left join sy_ugrpClass uc on uc.ugrpClassId = u.ugrpClass order by u.ugrpClass asc', function (err, recordset) {
        if (err) {
          winston.error(err);
          reject(2);
        }
        for (var i = 0; i < recordset.rowsAffected; i++) {
          if (ugrpClassName == recordset.recordset[i].ugrpClassName && i < recordset.rowsAffected - 1) {
            adug.push({
              ugrpName: recordset.recordset[i].ugrpName,
              ugrpId: recordset.recordset[i].ugrpId
            });
          }
          else if (ugrpClassName == recordset.recordset[i].ugrpClassName && i == recordset.rowsAffected - 1) {
            adug.push({
              ugrpName: recordset.recordset[i].ugrpName,
              ugrpId: recordset.recordset[i].ugrpId
            });
            aduglist.push({
              mainClass: ugrpClassName,
              ug: adug
            });
          }
          else if (ugrpClassName != recordset.recordset[i].ugrpClassName && ugrpClassName != '' && i < recordset.rowsAffected - 1) {
            aduglist.push({
              mainClass: ugrpClassName,
              ug: adug
            });
            adug = [];
            ugrpClassName = recordset.recordset[i].ugrpClassName;
            adug.push({
              ugrpName: recordset.recordset[i].ugrpName,
              ugrpId: recordset.recordset[i].ugrpId
            });
          }
          else if (ugrpClassName != recordset.recordset[i].ugrpClassName && ugrpClassName != '' && i == recordset.rowsAffected - 1) {
            aduglist.push({
              mainClass: ugrpClassName,
              ug: adug
            });
            adug = [];
            ugrpClassName = recordset.recordset[i].ugrpClassName;
            adug.push({
              ugrpName: recordset.recordset[i].ugrpName,
              ugrpId: recordset.recordset[i].ugrpId
            });
            aduglist.push({
              mainClass: ugrpClassName,
              ug: adug
            });
          }
          else if (ugrpClassName != recordset.recordset[i].ugrpClassName && ugrpClassName == '' && i == recordset.rowsAffected - 1) {
            ugrpClassName = recordset.recordset[i].ugrpClassName;
            adug.push({
              ugrpName: recordset.recordset[i].ugrpName,
              ugrpId: recordset.recordset[i].ugrpId
            });
            aduglist.push({
              mainClass: ugrpClassName,
              ug: adug
            });
          }
          else if (ugrpClassName != recordset.recordset[i].ugrpClassName && ugrpClassName == '' && i < recordset.rowsAffected - 1) {
            ugrpClassName = recordset.recordset[i].ugrpClassName;
            adug.push({
              ugrpName: recordset.recordset[i].ugrpName,
              ugrpId: recordset.recordset[i].ugrpId
            });
          }
        }

        ugrpClass = recordset.recordset;
        resolve(1);
      });
    });
    var p2 = new Promise(function (resolve, reject) {
      db.query('SELECT ROW_NUMBER() OVER (ORDER BY uw.ugrpId ASC) as no, uw.userId, uw.ugrpId, convert(varchar, uw.modifyDate, 120)modifyDate, uw.modifyName, uc.ugrpClassName, ug.ugrpName FROM sy_userWithUgrp uw left join sy_ugrp ug on ug.ugrpId = uw.ugrpId left join sy_ugrpClass uc on uc.ugrpClassId = ug.ugrpClass' + where, function (err, recordset) {
        if (err) {
          winston.error(err);
          reject(2);
        }
        userRole = recordset.recordset;
        resolve(1);
      });
    });
    var p3 = new Promise(function (resolve, reject) {
      db.query('SELECT userId,password,userName,email,convert(varchar,lastVisit, 120)lastVisit,telephone,convert(varchar,modifyTime, 120)modifyTime,convert(varchar,createdDate, 120)createdDate,bookmark,modifyName,uID,convert(varchar,loginTime, 120)loginTime,isstop from sy_infouser' + where, function (err, recordset) {
        if (err) {
          winston.error(err);
          reject(2);
        }
        items = recordset.recordset;
        if (recordset.recordset[0].isstop == 'Y')
          checked = 'checked';
        else
          checked = '';
        resolve(1);
      });
    });
    Promise.all([p1, p2, p3]).then(function (results) {
      var modelList = req.session.modelList;
      var navMenuList = req.session.navMenuList;
      var mgrMenuList = req.session.mgrMenuList;
      res.render('UserInfoEdit', {
        'user': req.user,
        'modelInfo': items[0],
        'funcName': '帳號管理',
        'ugrpClass': ugrpClass,
        'userRole': userRole,
        'checked': checked,
        'modelList': modelList,
        'navMenuList': navMenuList,
        'mgrMenuList': mgrMenuList,
        'ugclass': JSON.stringify(aduglist)
      });
    }).catch(function (e) {
      winston.error(e);
    });
  });

  router.get('/user/forget', function (req, res) {
    res.render('forget-pwd', {
      layout: 'layout-login'
    });
  });

  router.post('/user/forget_act', function (req, res) {
    let userId = req.body.userId || '';
    let email = req.body.email || '';
    let token = shortid.generate();
    let sql = "SELECT count(*) total " +
      " FROM sy_infouser " +
      " WHERE userId = @userId and email = @email ";

    let request = _connector.queryRequest()
      .setInput('userId', _connector.TYPES.NVarChar, userId)
      .setInput('email', _connector.TYPES.NVarChar, email);
    Q.nfcall(request.executeQuery, sql).then((result) => {
      let total = result[0].total;
      return total;
    }).then((total) => {
      if (total == 0) {
        res.redirect("/");
      }
      else {
        sql = "INSERT sy_ForgotPwd (userId,email,token,create_datetime) " +
          " VALUES(@userId,@email,@token,GETDATE())";
        request = _connector.queryRequest()
          .setInput('userId', _connector.TYPES.NVarChar, userId)
          .setInput('email', _connector.TYPES.NVarChar, email)
          .setInput('token', _connector.TYPES.NVarChar, token);
        return Q.nfcall(request.executeUpdate, sql)
      }
    }).then((resultset) => {
      let url = "?userId=" + userId + "&token=" + token;
      let sendInfo = {
        "subject": "和泰大數據平台-更改密碼",
        "content": `親愛的使用者：<br/>您的密碼已經重新設定，請至<a href="http://${process.env.HOST}:${process.env.PORT}/system/user/pwd/change${url}">和泰大數據平台</a>登入系統並進行密碼變更，謝謝。`
      }

      mail_util.htmlMail(email, sendInfo, function (err, result) {
        if (err) {
          winston.error('===forgetpwd failed:', err);
          res.redirect("/");
        }
        else {
          res.render('message', {
            layout: 'layout-login',
            message: "更改密碼信已寄出，請至信箱收取更改密碼信函"
          });
        }

      });
    }).fail((err) => {
      winston.error('===forgetpwd failed:', err);
      res.send(err);
    });
  });
  router.get('/user/pwd/change', function (req, res) {
    let userId = req.query.userId || '';
    let token = req.query.token || '';
    let sql = "SELECT count(*) total " +
      " FROM sy_ForgotPwd " +
      " WHERE token = @token and ( is_send != 'Y' or is_send is null )  ";

    let request = _connector.queryRequest()
      .setInput('token', _connector.TYPES.NVarChar, token)
    Q.nfcall(request.executeQuery, sql).then((result) => {
      let total = result[0].total;
      return total;
    }).then((total) => {
      if (total == 0) {
        res.redirect("/");
      }
      else {
        res.render('change-pwd', {
          layout: 'layout-login',
          userId: userId,
          token: token
        })
      }
    }).fail((err) => {
      winston.error('===forgetpwd failed:', err);
      res.redirect("/");
    });
  });

  router.post('/user/pwd/change_act', function (req, res) {
    let password = req.body.password || '';
    let token = req.body.token || '';
    let userId = req.body.userId || '';
    let sql = "UPDATE sy_infouser " +
      " SET password = @password, modifyTime = GETDATE()" +
      " WHERE userId = @userId  ";

    let request = _connector.queryRequest()
      .setInput('password', _connector.TYPES.NVarChar, password)
      .setInput('userId', _connector.TYPES.NVarChar, userId);
    Q.nfcall(request.executeUpdate, sql).then((result) => {
      return result;
    }).then((result) => {
      sql = "UPDATE sy_ForgotPwd " +
        " SET is_send = 'Y', update_datetime = GETDATE()" +
        " WHERE token = @token  ";
      let request = _connector.queryRequest()
        .setInput('token', _connector.TYPES.NVarChar, token)
      return Q.nfcall(request.executeUpdate, sql)
    }).then((resultset) => {
      res.render('message', {
        layout: 'layout-login',
        message: "密碼已更改成功，請重新登入"
      })

    }).fail((err) => {
      winston.error('===forgetpwd failed:', err);
      res.redirect("/");
    });
  });
  return router;
};
