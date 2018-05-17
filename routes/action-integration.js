"use strict";
const express = require('express');
const Q = require('q');
const winston = require('winston');
const boom = require('boom');
const middleware = require('../middlewares/login-check');
const modelService = require('../services/model-service');

module.exports = (app) => {
  console.log('[TargetRoute::create] Creating target route.');
  const router = express.Router();

  router.get('/query', function (req, res, next) {
    let modelList = req.session.modelList;
    let navMenuList = req.session.navMenuList;
    let mgrMenuList = req.session.mgrMenuList;

    res.render('container', {
      user: req.user,
      menuTitle: '顧客數據導出',
      modelList: modelList,
      navMenuList: navMenuList,
      mgrMenuList: mgrMenuList
    });
  });

  router.get('/:mode/query/:queryId', function (req, res, next) {
    let modelList = req.session.modelList;
    let navMenuList = req.session.navMenuList;
    let mgrMenuList = req.session.mgrMenuList;

    res.render('container', {
      user: req.user,
      menuTitle: '顧客360查詢結果',
      modelList: modelList,
      navMenuList: navMenuList,
      mgrMenuList: mgrMenuList
    });
  });

  router.get('/anonymous/query', function (req, res, next) {
    let modelList = req.session.modelList;
    let navMenuList = req.session.navMenuList;
    let mgrMenuList = req.session.mgrMenuList;

    res.render('container', {
      user: req.user,
      menuTitle: '線上用戶分析',
      modelList: modelList,
      navMenuList: navMenuList,
      mgrMenuList: mgrMenuList
    });
  });

  router.get('/:mode/query/:queryId/analysis/:size', function (req, res, next) {
    let modelList = req.session.modelList;
    let navMenuList = req.session.navMenuList;
    let mgrMenuList = req.session.mgrMenuList;

    res.render('container-chart', {
      user: req.user,
      menuTitle: '顧客樣貌分析報表',
      modelList: modelList,
      navMenuList: navMenuList,
      mgrMenuList: mgrMenuList
    });
  });

  return router;
};