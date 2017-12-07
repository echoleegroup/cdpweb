"use strict";
var db  = require("../utils/sql-server-connector").db;
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Route_1 = require("./Route");
var modelRoute = (function (_super) {
    __extends(modelRoute, _super);
    function modelRoute() {
        return _super.call(this) || this;
    }
    modelRoute.create = function (router) {
        console.log('[modelRoute::create] Creating model route.');
		router.get('/modelList', function (req, res) {
			if( req.session.userid && req.session.userid != ''){
				var startDate = req.query.startDate ||'' ;
				var endDate = req.query.endDate ||'' ;
				var isClosed = req.query.isClosed ||'' ;	
				var condition = [] ;
				var where = " where sc.codeGroup = 'mdGoal' and sc.codeValue = mm.mdGoal and mm.mdID = mb.mdID and mm.batID = mb.batID and ( mm.isDel <> 'Y' or mm.isDel is null) ";
				if( startDate != '' ) {
					where += " and exeDateFrom >= '"+startDate+ " 00:00:00' ";
					condition.push({
						"query" : "起:" +startDate
					});					
				}
				if( endDate != '' ) {
					where += " and exeDateFrom <= '"+endDate+ " 23:59:59' ";
					condition.push({
						"query" : "終:" +endDate
					});	
				}
				if( isClosed =='on'){
					where += " and ( mm.isClosed is not null or mm.isClosed is null ) " ;
					condition.push({
						"query" : "含已結案模型"
					});	
					
				}
				else{
					where += " and ( mm.isClosed <> 'Y' or mm.isClosed is null ) ";
				}
				
				db.query("SELECT mm.*,convert(varchar, mb.lastTime, 111)lastTime,sc.codeLabel FROM md_Model mm,md_Batch mb,sy_CodeTable sc "+where+ " order by mb.lastTime desc" ,function(err,recordset){
					//send records as a respons
					var modellist = req.session["modellist"]  ;
					var menuJson = req.session["menuJson"]  ;
					res.render('commonList', {'id' : req.session.userid, 'items' : recordset.recordset, 'condition' : JSON.stringify(condition),'modellist' :JSON.stringify(modellist), 'menuJson':JSON.stringify(menuJson)});
				});
			}
			else{
				res.render('index', {'title' : req.session.userid, 'items' : ""});
			}			
        });
		
    };
    return modelRoute;
}(Route_1.BaseRoute));
exports.modelRoute = modelRoute;


