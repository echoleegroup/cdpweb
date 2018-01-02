"use strict";

const boom = require('boom');
const express = require("express");
const passport = require('passport');
const winston = require('winston');
const _ = require("lodash");
const Q = require('q');
const menuService = require('../services/menu-service');
const modelService = require('../services/model-service');
const userService = require('../services/user-service');
const DEFAULT_LOGIN_PATH = '/login';
const DEFAULT_HOME_PATH = '/home';

const getUserPermission = (userId) => {
  return Q.nfcall(userService.getUserUgrpMenu, userId).then((resultSet) => {
    return resultSet.reduce((accumulator, value, index) => {
      if (!accumulator[value.menuCode]) {
        accumulator[value.menuCode] = {}
      }
      accumulator[value.menuCode].read = accumulator[value.menuCode].read || (value.isRead === 'Y');
      accumulator[value.menuCode].edit = accumulator[value.menuCode].edit || (value.isEdit === 'Y');
      accumulator[value.menuCode].download = accumulator[value.menuCode].download || (value.isDownload === 'Y');
      return accumulator;
    }, {});
  });
};

const getModels = () => {
  return Q.nfcall(modelService.getModels).then((resultSet) => {
    return resultSet.map((row) => {
      return {
        mdID: row.mdID,
        mdName: row.mdName,
        batID: row.batID
      };
    });
  });
};

module.exports = (app) => {
  winston.info('[LoginRoute::create] Creating index route.');
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
  }), (req, res, next) => {
    let user = req.user;
    let userId = req.session.userid = user.userId;

    winston.info('===get user: %j', user);
    let promises = [
      getUserPermission(userId),
      getModels(),
      Q.nfcall(menuService.getMenuTree)
    ];
    Q.all(promises).spread((permission, models, menuTree) => {
      let navMenuList = [];
      let mgrMenuList = [];
      for (let menu of menuTree) {
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

      return [permission, models, navMenuList, mgrMenuList];
    }).spread((permission, models, navMenuList, mgrMenuList) => {
      req.session.permission = permission;
      req.session.modelList = models;
      req.session.navMenuList = navMenuList;
      req.session.mgrMenuList = mgrMenuList[0];
      res.redirect(DEFAULT_HOME_PATH);
    }).fail(err => {
      winston.error('=== get user login extended data failed: %j', err);
      next(boom.serverUnavailable());
    });
  });

  return router;
};
