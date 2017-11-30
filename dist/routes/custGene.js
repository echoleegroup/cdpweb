"use strict";
var db  = require("../utils/sql-server-connector").db;
var java_api_endpoint = require("../config/app-config").get("JAVA_API_ENDPOINT");
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Route_1 = require("./Route");
var custGeneRoute = (function (_super) {
    __extends(custGeneRoute, _super);
    function custGeneRoute() {
        return _super.call(this) || this;
    }
    custGeneRoute.create = function (router) {
        console.log('[custGeneRoute::create] Creating custGene route.');
		router.get('/custGeneCP', function (req, res) {
			if( req.session.userid && req.session.userid != ''){
				var mdID = req.query.mdID ||'' ;
				var batID = req.query.batID ||'' ;
				var where = " where mdID = '"+mdID+"' and batID = '"+batID+"' ";
				var splNum = 0 ;
				var popNum = 0 ;
				var items ;
				var p1 = new Promise(function(resolve, reject){db.query("select count(*) total from md_ListDet "+ where +" and mdListCateg ='spl'" ,function(err,recordset){
							if(err) { 
								console.log(err);
								reject(2);
							}
							splNum = recordset.recordset[0].total;
							resolve(1);
						});
				});
				var p2 = new Promise(function(resolve, reject){db.query("select count(*) total from md_ListDet "+ where +" and mdListCateg ='pop'" ,function(err,recordset){
							if(err) { 
								console.log(err);
								reject(2);
							}
							popNum = recordset.recordset[0].total;
							resolve(1);
						});
				});	
				Promise.all([p1, p2]).then(function (results) {
						db.query("SELECT mm.*,convert(varchar, mb.lastTime, 111)lastTime FROM md_Model mm,md_Batch mb where mm.mdID = mb.mdID and mm.batBinded = mb.batID and mm.mdID = '"+mdID+"' and mm.batBinded ='"+batID+"'" ,function(err,recordset){
							if(err) { 
								console.log(err);
							}
							items = recordset.recordset;
							var modellist = req.session["modellist"]  ;
							var menuJson = req.session["menuJson"]  ;
							res.render('custGeneCP', {'id' : req.session.userid, 'items' : items,'popNum' : popNum,'splNum' :splNum, 'modellist' :JSON.stringify(modellist), 'menuJson':JSON.stringify(menuJson),'api':java_api_endpoint});
						});
						
					}).catch(function (e){
						console.log(e);
				
				});		
				
				
			}
			else{
				res.render('index', {'title' : req.session.userid, 'items' : ""});
			}	
			
        });
		
    };
    return custGeneRoute;
}(Route_1.BaseRoute));
exports.custGeneRoute = custGeneRoute;
