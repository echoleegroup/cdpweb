"use strict";
const express = require("express");
const winston = require('winston');
const db  = require("../utils/sql-server-connector").db;
const middleware = require("../middlewares/login-check");

module.exports = (app) => {

    console.log('[IndexRoute::create] Creating index route.');
    var router = express.Router();

    router.get('/', (req, res) => {
      res.redirect('/home');
    });

    router.get('/home', middleware.check(), (req, res) => {
      var modelList = req.session.modelList ;
      var navMenuList = req.session.navMenuList ;
      var mgrMenuList = req.session.mgrMenuList ;
      //console.log('====modelList: ', JSON.stringify(modelList));
      //console.log('====navMenuList: ', JSON.stringify(navMenuList));
      //console.log('====mgrMenuList: ', JSON.stringify(mgrMenuList));
      res.render('main', {
          'id': req.user.userId, 
          'modelList': modelList, 
          'navMenuList': navMenuList,
          'mgrMenuList': mgrMenuList
      });
    });

    return router;
};
