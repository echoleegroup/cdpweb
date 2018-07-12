"use strict";
const express = require("express");
const winston = require('winston');
const middleware = require("../middlewares/login-check");

module.exports = (app) => {

  winston.info('[IndexRoute::create] Creating index route.');
  var router = express.Router();

  router.get('/', (req, res) => {
    res.redirect('/home');
  });

  router.get('/home', middleware.check(), (req, res) => {
    var modelList = req.session.modelList;
    var navMenuList = req.session.navMenuList;
    var mgrMenuList = req.session.mgrMenuList;
    //winston.info('====modelList: ', JSON.stringify(modelList));
    //winston.info('====navMenuList: ', JSON.stringify(navMenuList));
    //winston.info('====mgrMenuList: ', JSON.stringify(mgrMenuList));
    res.render('main', {
      'user': req.user,
      'modelList': modelList,
      'navMenuList': navMenuList,
      'mgrMenuList': mgrMenuList
    });
  });

  return router;
};
