"use strict";
var db  = require("../utils/sql-server-connector").db;
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Route_1 = require("./Route");
var modelDownloadRoute = (function (_super) {
    __extends(modelDownloadRoute, _super);
    function modelDownloadRoute() {
        return _super.call(this) || this;
    }
    modelDownloadRoute.create = function (router) {
        console.log('[modelDownloadRoute::create] Creating modelDownload route.');
		router.get('/modelDownload', function (req, res) {
			var mdID = req.query.mdID ||'' ;
			var batID = req.query.batID ||'' ;
			var where = " where mdID = '"+mdID+"' and batID = '"+batID+"' and mdListCateg ='tapop' order by mdListScore asc ";
			var items ;
			var scrore = 0.8 ;
			var chartData = [];
			var batListThold = 0.0 ;
			var modelinfo ;
			var mdListCategCount = [] ;
			var tacount = 0 ;
			var tapopcount = 0 ;
			var splcount = 0 ;
			if( req.session.userid && req.session.userid != ''){
				var p1 = new Promise(function(resolve, reject){db.query("SELECT batListThold FROM md_ListMst WHERE batID = '"+batID+"' and mdID ='"+mdID+"'  " ,function(err,recordset){
							if(err) { 
								console.log(err);
								reject(2);
							}
							batListThold = recordset.recordset[0].batListThold;
							resolve(1);
						});
				});
			    var p2 = new Promise(function(resolve, reject){db.query("SELECT mdName,batBinded,splName,splDesc,popName,popDesc,taName,taDesc,convert(varchar, updTime, 111)updTime FROM md_Model where mdID ='"+mdID+"' and batBinded = '"+batID+"' " ,function(err,recordset){
							if(err) { 
								console.log(err);
								reject(2);
							}
							modelinfo = recordset.recordset;
							resolve(1);
						});
				});
				var p3 = new Promise(function(resolve, reject){db.query("SELECT count(*) total ,mdListCateg FROM md_ListDet WHERE batID = '"+batID+"' and mdID ='"+mdID+"' and (mdListCateg ='spl' or mdListCateg ='tapop' or  mdListCateg ='ta') group by mdListCateg " ,function(err,recordset){
							if(err) { 
								console.log(err);
								reject(2);
							}
							for( var i = 0 ; i < recordset.rowsAffected ; i++ ){
								if(recordset.recordset[i].mdListCateg == 'spl') {
									var item1 = {
										"mdListCateg" : "已購客群",
										"total":recordset.recordset[i].total
									}
									splcount = recordset.recordset[i].total ;
								}
								else if(recordset.recordset[i].mdListCateg == 'tapop') {
									var item1 = {
										"mdListCateg" : "潛在客群",
										"total":recordset.recordset[i].total
									}
									tapopcount = recordset.recordset[i].total ;
								}
								else if(recordset.recordset[i].mdListCateg == 'ta') {
									var item1 = {
										"mdListCateg" : "模型受眾",
										"total":recordset.recordset[i].total
									}
									tacount = recordset.recordset[i].total ;
								}
								mdListCategCount.push(item1);
							}
							
							
							
							resolve(1);
						});
				});
				Promise.all([p1, p2, p3]).then(function (results) {
						db.query("SELECT mdListScore FROM md_ListDet "+where ,function(err,recordset){
							if(err) { 
								console.log(err);
								
							}
							var x = 0.0 ;
							var total = 0 ;
							for( x = 0 ; x <=100 ; x = x + 5) {
								for( var i = 0 ; i < recordset.rowsAffected ; i++ ){
									if( x <= recordset.recordset[i].mdListScore*100 &&   recordset.recordset[i].mdListScore *100 < x+5 ) 
											total++ ;
								}
								if( x <  batListThold *100 ) {
									var item1 = {
										"lineColor": "#d4d4d4",
										"mdListScore" : x/100,
										"total":total
									}
								}
								else{
									var item1 = {
										"lineColor": "#7caf0c",
										"mdListScore" : x/100,
										"total":total
									}
									
								}
								chartData.push(item1);
								total = 0 ;
							}			
							var modellist = req.session.modellist ;
							var menuJson = req.session.menuJson ;
							res.render('modelDownload', {'id' : req.session.userid, 'chartData' : JSON.stringify(chartData)
							,'tacount' : tacount ,'mdListCategCount' : JSON.stringify(mdListCategCount), 'modelinfo' : modelinfo, 'batListThold' : batListThold,'mdID' : mdID, 'batID' :batID,
							'menuJson' : JSON.stringify(menuJson),'modellist' :JSON.stringify(modellist),'tapopcount':tapopcount,'splcount':splcount});
						});
					}).catch(function (e){
						console.log(e);
				});		
			
				
				
				
			
			}
			else{
				res.render('index', {'title' : req.session.userid, 'items' : ""});
			}			
        });
		router.get('/modelDownloadact', function (req, res) {
			var mdID = req.query.mdID ||'' ;
			var batID = req.query.batID ||'' ;
			var tapopcount = req.query.tapopcount ||'' ;
			var ex12c = req.query.ex12c ||'' ;
			var num = req.query.num ||'' ;
			var usemethod = req.query.method ||'' ;
			var path = "/jsoninfo/downloadxls.do?mdID="+encodeURI(mdID)+"&batID="+encodeURI(batID)+"&scope="+encodeURI(ex12c)+"&total="+num+"&method="+usemethod+"&tapopcount="+tapopcount
			var http = require('http');
				var options = {
					host: "127.0.0.1",
					port: 8080,
					path: path,
					method: 'GET',
					headers: {
						'Content-Type': 'application/json; charset=utf-8'
				
					}
					
				};
       
				http.request(options, function(resp) {
					var msg = '';
					resp.setEncoding('utf8');
					resp.on('data', function(chunk) {
						msg += chunk;
					});
					resp.on('end', function() {
						const fs = require('fs');
						const path = require('path');
						res.setHeader('Content-Type', 'application/vnd.openxmlformats');  
						res.setHeader("Content-Disposition", "attachment; filename=file.xls"); 
						res.sendFile(JSON.parse(msg).jsonOutput.data);
					});
				}).end();
		});
		
    };
    return modelDownloadRoute;
}(Route_1.BaseRoute));
exports.modelDownloadRoute = modelDownloadRoute;


