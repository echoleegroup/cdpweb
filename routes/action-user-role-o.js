"use strict";
const express = require('express');
const winston = require('winston');
const _ = require("lodash");
const Q = require('q');
const middleware = require("../middlewares/login-check");
const permission = require("../utils/constants").MENU_CODE;
const db = require("../utils/sql-server-connector").db;
const menuService = require('../services/menu-service');

module.exports = (app) => {
  console.log('[userRoleRoute::create] Creating userRole route.');
  const router = express.Router();

  router.post('/user/role/add_act', [middleware.check(), middleware.checkEditPermission(permission.USER_ROLE)], function (req, res) {
    var ugrpId;
    var ugrpClass = req.body.ugrpClass || '';
    var ugrpName = req.body.ugrpName || '';
    var remark = req.body.remark || '';
    var isstop = req.body.isstop || '';
    var checked = 'N';
    if (isstop == 'on')
      checked = 'Y';
    var p1 = new Promise(function (resolve, reject) {
      db.query("INSERT INTO sy_ugrp(ugrpClass,ugrpName,remark,regdate,modifyDate,signer,isStop) values('" + ugrpClass + "','" + ugrpName + "','" + remark + "',GETDATE(),GETDATE(),'" + req.user.userId + "','" + checked + "')", function (err, recordset) {
        if (err) {
          console.log(err);
          reject(2);
        }

        resolve(1);

      });
    });
    Promise.all([p1]).then(function (results) {
      db.query('select top 1 ugrpId from sy_ugrp order by ugrpId desc ', function (err, recordset) {
        if (err) console.log(err);
        res.redirect('/system/user/role/edit?ugrpId=' + recordset.recordset[0].ugrpId);
      });
    }).catch(function (e) {
      console.log(e);
    });



  });

  router.get('/user/role/add', function (req, res) {
    db.query("SELECT * FROM sy_ugrpClass", function (err, recordset) {
      if (err) console.log(err);
      var modelList = req.session.modelList;
      var navMenuList = req.session.navMenuList;
      var mgrMenuList = req.session.mgrMenuList;
      res.render('userRoleAdd', {
        'user': req.user,
        'ugrpClass': recordset.recordset,
        'modelList': modelList,
        'navMenuList': navMenuList,
        'mgrMenuList': mgrMenuList
      });
    });

  });

  router.get('/user/role/search', [middleware.check(), middleware.checkViewPermission(permission.USER_ROLE)], function (req, res) {
    var modelList = req.session.modelList;
    var navMenuList = req.session.navMenuList;
    var mgrMenuList = req.session.mgrMenuList;
    res.render('userRoleSearch', {
      'user': req.user,
      'modelList': modelList,
      'navMenuList': navMenuList,
      'mgrMenuList': mgrMenuList
    });
  });

  router.post('/user/role/list', [middleware.check(), middleware.checkViewPermission(permission.USER_ROLE)], function (req, res) {
    var ugrpName = req.body.ugrpName || '';
    var where = " where 1=1 ";
    if (ugrpName != '')
      where += " and ugrpName like '%" + ugrpName + "%' ";
    db.query("SELECT  ROW_NUMBER() OVER (ORDER BY uc.ugrpClassId ASC) as no ,ugrpId,ugrpClass,ugrpName,uc.ugrpClassName,isStop,remark FROM sy_ugrp ug left join sy_ugrpClass uc on uc.ugrpClassId = ug.ugrpClass" + where + " order by uc.ugrpClassId asc", function (err, recordset) {
      if (err) console.log(err);
      //send records as a respons
      var modelList = req.session.modelList;
      var navMenuList = req.session.navMenuList;
      var mgrMenuList = req.session.mgrMenuList;
      res.render('userRoleList', {
        'user': req.user,
        'items': recordset.recordset,
        'modelList': modelList,
        'navMenuList': navMenuList,
        'mgrMenuList': mgrMenuList 
      });
    });
  });

  router.post('/user/role/authority/del', [middleware.check(), middleware.checkEditPermission(permission.USER_ROLE)], function (req, res) {
    var ugrpId = req.body.ugrpId || '';
    var menuId = req.body.menuId || '';
    db.query("delete from sy_ugrpcode where ugrpId =" + ugrpId + " and menuId = " + menuId, function (err, recordset) {
      if (err) console.log(err);
      //send records as a respons
      res.end('ok');

    });
  });

  router.post('/user/role/authority/add', [middleware.check(), middleware.checkEditPermission(permission.USER_ROLE)], function (req, res) {
    var ugrpId = req.body.ugrpId || '';
    var menuCode = req.body.menuCode || '';
    var all = req.body.all || '';
    var Read = req.body.Read || '';
    var Edit = req.body.Edit || '';
    var Download = req.body.Download || '';
    var menuId = '';
    if (all == "true")
      all = 'Y';
    else
      all = 'N';
    if (Read == "true")
      Read = 'Y';
    else
      Read = 'N';
    if (Edit == "true")
      Edit = 'Y';
    else
      Edit = 'N';
    if (Download == "true")
      Download = 'Y';
    else
      Download = 'N';
    var p1 = new Promise(function (resolve, reject) {
      console.log("SELECT menuId From sy_menu where menuCode = '" + menuCode + "'");
      db.query("SELECT menuId From sy_menu where menuCode = '" + menuCode + "'", function (err, recordset) {
        if (err) {
          console.log(err);
          reject(err);
        }
        menuId = recordset.recordset[0].menuId;
        resolve(menuId);
      });
    });
    Promise.all([p1]).then(function (results) {
      function addAuthority(ugrpId, menuId, all, Read, Edit, Download, callback) {
        var where = " where ugrpId = " + ugrpId + " and menuId =" + menuId;
        db.query('select count(*) total from sy_ugrpcode' + where, function (err, recordset) {
          if (err)
            callback(err, null);
          else
            callback(null, recordset.recordset[0].total);
        });
      }

      addAuthority(ugrpId, menuId, all, Read, Edit, Download, function (err, data) {
        if (err)
          console.log("ERROR : ", err);
        else if (data != 0) {
          var where = " where ugrpId = " + ugrpId + " and menuId =" + menuId;
          db.query("update sy_ugrpcode set isAll = '" + all + "',isRead = '" + Read + "',isEdit = '" + Edit + "',isDownload = '" + Download + "',modifyDate = GETDATE(),modifyUser ='" + req.user.userId + "'" + where, function (err, recordset) {
            if (err)
              console.log("ERROR : ", err);
            res.end('更新成功');
          });
        }
        else {
          var values = "VALUES(" + ugrpId + "," + menuId + ",GETDATE(),GETDATE(),'" + req.user.userId + "','" + all + "','" + Read + "','" + Edit + "','" + Download + "')"
          db.query("INSERT INTO sy_ugrpcode(ugrpId,menuId,modifyDate,regDate,modifyUser,isAll,isRead,isEdit,isDownload)" + values, function (err, recordset) {
            if (err)
              console.log("ERROR : ", err);
            res.end('新增成功');
          });
        }
      });
    }).catch(function (e) {
      console.log(e);
    });
  });

  router.post('/user/role/edit_act', [middleware.check(), middleware.checkEditPermission(permission.USER_ROLE)], function (req, res) {
    var ugrpId = req.body.ugrpId || '';
    var ugrpClass = req.body.ugrpClass || '';
    var ugrpName = req.body.ugrpName || '';
    var remark = req.body.remark || '';
    var isstop = req.body.isstop || '';
    var checked = 'N';
    if (isstop == 'on')
      checked = 'Y';
    var where = " where ugrpId ='" + ugrpId + "'";
    db.query("update sy_ugrp set ugrpClass = '" + ugrpClass + "', ugrpName = '" + ugrpName + "', remark = '" + remark + "', signer ='" + req.user.userId + "',modifyDate=GETDATE(),isStop = '" + checked + "'" + where, function (err, recordset) {
      if (err) console.log(err);
      //send records as a respons
      res.redirect('/system/user/role/edit?ugrpId=' + ugrpId);

    });
  });

  router.get('/user/role/edit', [middleware.check(), middleware.checkEditPermission(permission.USER_ROLE)], function (req, res) {
    var ugrpId = req.query.ugrpId || '';
    var where = " where ug.ugrpId ='" + ugrpId + "'";
    var checked;
    var ugrpClass;
    var authority;
    var items;
    var navMenuList = [];
    var menuList = [];
    var premenuName = '';
    var p1 = new Promise(function (resolve, reject) {
      db.query("SELECT ROW_NUMBER() OVER (ORDER BY ugrpId ASC) as no, ugrpId ,su.menuId,convert(varchar, su.modifyDate, 120)modifyDate,convert(varchar, regDate, 120)regDate,su.modifyUser,isRead,isEdit,isDownload,isAll,sm.menuName,sme.menuName pName FROM sy_ugrpcode su left join sy_menu sm on sm.menuId = su.menuId and sm.parentId is not null left join sy_menu sme on sme.menuId = sm.parentId and sme.parentId is null where su.ugrpId = " + ugrpId + " order by su.menuId asc ", function (err, recordset) {
        if (err) {
          console.log(err);
          reject(2);
        }
        authority = recordset.recordset;
        resolve(1);
      });
    });
    var p2 = new Promise(function (resolve, reject) {
      menuService.getMenuTree(function (err, result) {
        for (let menu of result) {
          let pointer = menuList;
          let parent = _.find(pointer, { menuCode: menu.preMenuCode });
          if (!parent) {
            parent = {
              menuCode: menu.preMenuCode,
              mainMenu: menu.premenuName,
              childMenu: []
            };
            pointer.push(parent);
          }
          parent.childMenu.push({
            menuName: menu.menuName,
            url: menu.url,
            menuCode: menu.menuCode
          });
        }
        resolve(menuList);
      })


    });
    var p3 = new Promise(function (resolve, reject) {
      db.query('select * from sy_ugrpClass', function (err, recordset) {
        if (err) {
          console.log(err);
          reject(2);
        }
        ugrpClass = recordset.recordset;
        resolve(6);
      });
    });
    var p4 = new Promise(function (resolve, reject) {
      db.query('select ug.ugrpId,ug.ugrpName,ug.remark,convert(varchar, ug.regdate, 120)regdate ,ug.ugrpClass,convert(varchar, ug.modifyDate, 120)modifyDate,ug.signer,ug.isStop,ugc.ugrpClassName from sy_ugrp ug LEFT JOIN sy_ugrpClass ugc on ugc.ugrpClassId = ug.ugrpClass' + where, function (err, recordset) {
        if (err) {
          console.log(err);
          reject(2);
        }
        items = recordset.recordset;
        //send records as a respons
        if (recordset.recordset[0].isStop == 'Y')
          checked = 'checked';
        else
          checked = '';
        resolve(7);
      });
    });
    Promise.all([p1, p2, p3, p4]).then(function (results) {
      var modelList = req.session.modelList;
      var navMenuList = req.session.navMenuList;
      var mgrMenuList = req.session.mgrMenuList;
      var allMenuList = menuList;
      res.render('UserGroupInfoEdit', {
        'user': req.user,
        'modelInfo': items[0],
        'checked': checked,
        'ugrpClass': ugrpClass,
        'authority': authority,
        'modelList': modelList,
        'navMenuList': navMenuList,
        'mgrMenuList': mgrMenuList,
        'menu': JSON.stringify(allMenuList)
      });
    }).catch(function (e) {
      console.log(e);
    });
  });
  return router;
};

