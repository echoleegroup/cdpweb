"use strict";
var express = require("express");
var db  = require("../utils/sql-server-connector").db;
var middleware = require("../middlewares/checksession");
/*
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Route_1 = require("./Route");
var IndexRoute = (function (_super) {
    __extends(IndexRoute, _super);
    function IndexRoute() {
        return _super.call(this) || this;
    }
    IndexRoute.create = function (router) {
        console.log('[IndexRoute::create] Creating index route.');
        router.get('/', middleware.checkLogin(), function (req, res) {
			db.query('select * from sy_infouser order by uID asc'  ,function(err,recordset){
				var modelList = req.session.modelList ;
				var navMenuList = req.session.navMenuList ;
				res.render('main', {'id' : req.session.userid, 'modelList' :JSON.stringify(modelList), 'navMenuList':navMenuList});
			});
        });
    };
    return IndexRoute;
}(Route_1.BaseRoute));
*/
//exports.IndexRoute = IndexRoute;
module.exports = () => {
    console.log('[IndexRoute::create] Creating index route.');
    var router = express.Router();
    router.get('/', middleware.checkLogin(), function (req, res) {
        db.query('select * from sy_infouser order by uID asc'  ,function(err,recordset){
            var modelList = req.session.modelList ;
            var navMenuList = req.session.navMenuList ;
            var mgrMenuList = req.session.mgrMenuList ;
            //console.log('====modelList: ', JSON.stringify(modelList));
            //console.log('====navMenuList: ', JSON.stringify(navMenuList));
            //console.log('====mgrMenuList: ', JSON.stringify(mgrMenuList));
            res.render('main', {
                'id': req.session.userid, 
                'modelList': modelList, 
                'navMenuList': navMenuList,
                'mgrMenuList': mgrMenuList
            });
        });
    });
    return router;
};
