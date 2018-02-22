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

  return router;
};