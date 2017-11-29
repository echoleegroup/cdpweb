"use strict";
var config  = require("../configuration/newconfig");
var db = config.db;
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
        router.get('/', function (req, res, next) {
            new IndexRoute().index(req, res, next);
        });
    };
    IndexRoute.prototype.index = function (req, res, next) {
		if ( req.session.userid && req.session.userid != '' ) {
			this.id = req.session.userid;
			db.query('select * from sy_infouser order by uID asc'  ,function(err,recordset){
				var modellist = req.session.modellist ;
				var menuJson = req.session.menuJson ;
				res.render(VIEW + 'main', {'id' : req.session.userid, 'items' : recordset.recordset, 'modellist' :JSON.stringify(modellist), 'menuJson':JSON.stringify(menuJson)});
			});
		}
		else{	
			res.render(VIEW + 'index');
		}
    };
    return IndexRoute;
}(Route_1.BaseRoute));
exports.IndexRoute = IndexRoute;

//# sourceMappingURL=Index.js.map
