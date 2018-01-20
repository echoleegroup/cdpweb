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

  router.get('/custom/filter/:mdId/:batId', middleware.check(), function (req, res, next) {
    let mdId = req.params.mdId;
    let batId = req.params.batId;
    let modelList = req.session.modelList;
    let navMenuList = req.session.navMenuList;
    let mgrMenuList = req.session.mgrMenuList;

<<<<<<< HEAD
=======
    res.render('container', {
      id: 'vvv',
      menuTitle: '自訂名單下載',
      modelInfo: {},
      modelList: [],
      navMenuList: [],
      mgrMenuList: []
    });
/*
>>>>>>> eb262f3... Initialize IntegratedAnalysis layout and components
    Q.nfcall(modelService.getModel, mdId).then((result) => {
      res.render('target-filter', {
        'id': req.user.userName,
        'modelInfo': result,
        'modelList': modelList,
        'navMenuList': navMenuList,
        'mgrMenuList': mgrMenuList
      });
    }).fail((err) => {
      winston.error('===/custom/filter/%s/%s failed:', mdId, batId,  err);
      next(boom.internal());
    });
  });

  return router;
};