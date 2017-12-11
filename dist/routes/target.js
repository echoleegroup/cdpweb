"use strict";
var express = require("express");
var db  = require("../utils/sql-server-connector").db;
var middleware = require("../middlewares/checksession");

module.exports = () => {
    console.log('[TargetRoute::create] Creating target route.');
    var router = express.Router();
    router.get('/customSearch', middleware.checkLogin(), function (req, res) {
        var modelList = req.session.modelList ;
        var navMenuList = req.session.navMenuList ;
        var mgrMenuList = req.session.mgrMenuList ;

        res.render('custom-search', {
            'id': req.session.userid, 
            'modelList': modelList, 
            'navMenuList': navMenuList,
            'mgrMenuList': mgrMenuList
        });
    });
    return router;
};