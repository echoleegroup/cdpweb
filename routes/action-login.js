"use strict";
const express = require("express");
const passport = require('passport');
const winston = require('winston');
const _ = require("lodash");
const db = require("../utils/sql-server-connector").db;
const DEFAULT_LOGIN_PATH = '/login';
const DEFAULT_HOME_PATH = '/home';

module.exports = (app) => {
  console.log('[LoginRoute::create] Creating index route.');
  var router = express.Router();

  router.get('/logout', function (req, res) {
    req.logout();
    res.redirect(DEFAULT_LOGIN_PATH);
    /*
    var userId = req.body.userId || '';
    var password = req.body.password || '';
    req.session.userid = "";
    res.redirect('/');
    */

  });

  router.get('/login', function (req, res) {
    let message = {};
    message.hasError = req.flash('error');
    res.render('index', {
      layout: 'layout-login',
      message: message
    });
  });

  app.post('/login', passport.authenticate('local', {
    failureRedirect: '/login',
    failureFlash: true
  }), (req, res) => {
    let user = req.user;
    let userId = req.session.userid = user.userId;

    //建立各個menu的權限
    var p2 = new Promise(function (resolve, reject) {
      db.query("SELECT syuw.userId,syuw.ugrpId ,sym.menuCode,syu.isRead,syu.isEdit,syu.isDownload FROM sy_userWithUgrp syuw left join sy_ugrpcode syu on syu.ugrpId = syuw.ugrpId left join sy_menu sym on sym.menuId = syu.menuId and sym.parentId is not null where userId = '" + userId + "' order by sym.menuId asc", function (err, result) {
        if (err) {
          //console.log(err);
          reject(err);
        }
        let permission = result.recordset.reduce((accumulator, value, index) => {
          if (!accumulator[value.menuCode]) {
            accumulator[value.menuCode] = {}
          }
          accumulator[value.menuCode].read = accumulator[value.menuCode].read || (value.isRead === 'Y');
          accumulator[value.menuCode].edit = accumulator[value.menuCode].edit || (value.isEdit === 'Y');
          accumulator[value.menuCode].download = accumulator[value.menuCode].download || (value.isDownload === 'Y');
          return accumulator;
        }, {});
        resolve(permission);
      });
    });
    var p3 = new Promise(function (resolve, reject) {
      db.query("SELECT mdID,mdName,batID FROM md_Model order by updTime desc ", function (err, result) {
        if (err) {
          //console.log(err);
          reject(err);
        }
        let modelList = result.recordset.map((row, index) => {
          return {
            mdID: row.mdID,
            mdName: row.mdName,
            batID: row.batID
          };
        });
        resolve(modelList);
      });

    });

    Promise.all([p2, p3]).then(function (results) {
      let permission = results[0];
      let modelList = results[1];
      let navMenuList = [];
      let mgrMenuList = [];
      db.query('SELECT sm.menuCode,sm.parentId,sm.menuName,sm.modifyDate,sm.modifyUser,sm.url, sm.sticky,pym.menuName premenuName, pym.menuCode preMenuCode, pym.sticky preSticky FROM sy_menu sm left join sy_menu pym on sm.parentId = pym.menuId where sm.parentId is not null', function (err, result) {
        console.log('===permission: ', permission);
        for (let menu of result.recordset) {
          let pointer = (menu.preSticky === '_mgr') ? mgrMenuList : navMenuList;
          if (permission[menu.menuCode] && permission[menu.menuCode].read) {
            let parent = _.find(pointer, { menuCode: menu.preMenuCode });
            if (!parent) {
              parent = {
                menuCode: menu.preMenuCode,
                mainMenu: menu.premenuName,
                _model: (menu.preSticky === '_model'),
                _mgr: (menu.preSticky === '_mgr'),
                childMenu: []
              };
              pointer.push(parent);
            }
            parent.childMenu.push({
              menuName: menu.menuName,
              url: menu.url,
              sticky: menu.sticky,
              menuCode: menu.menuCode
            });
          }
        }

        req.session.permission = permission;
        req.session.modelList = modelList;
        req.session.navMenuList = navMenuList;
        req.session.mgrMenuList = mgrMenuList[0];
        res.redirect(DEFAULT_HOME_PATH);
      });
    }).catch(function (e) {
      console.log(e);
    });
  });

  return router;
};
