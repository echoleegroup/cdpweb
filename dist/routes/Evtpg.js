"use strict";
var config  = require("../configuration/newconfig");
var db = config.db;
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Route_1 = require("./Route");

var EvtpgRoute = (function (_super) {
    __extends(EvtpgRoute, _super);
    function EvtpgRoute() {
        return _super.call(this) || this;
    }
    EvtpgRoute.create = function (router) {
        console.log('[EvtpgRoute::create] Creating Evtpg route.');
		router.post('/addEvtpgTag', function (req, res) {
			var evtpgID =  req.body.evtpgID;
			var newtag =  req.body.newtag;
			var issame = '' ; 
			var tagID ;
			newtag = newtag.trim();
			var p1 = new Promise(function(resolve, reject){db.query("SELECT evtpgID FROM dm_EvtpgTag where evtpgID="+evtpgID+" and tagLabel ='"+newtag+"' " ,function(err,recordset){
					if(err) {
						console.log(err);
						reject(2);
					}
					if( recordset.rowsAffected != 0 ) 
						issame = 'Y' ;
					else 
						issame = 'N' ;
					resolve(1);	
				});
			});
			Promise.all([p1]).then(function (results) {
				if(issame =='Y') 
					res.end("已新增過");
				else {
					function addtag(evtpgID,newtag,callback){
						db.query("INSERT INTO dm_EvtpgTag(evtpgID,tagLabel,tagSource,updTime,updUser) VALUES("+evtpgID+",'"+newtag+"','m',GETDATE(),'"+req.session.userid+"') ",function(err,recordset){
							if (err) 
								callback(err, null);
							else 
								callback(null, 0);
		                });
					}
					addtag(evtpgID,newtag,function(err,data){
						if (err) 
							console.log("ERROR : ",err);
						else{
							db.query("SELECT TOP 1 tagID FROM dm_EvtpgTag where evtpgID ="+evtpgID+" order by tagID desc  ",function(err,recordset){
								if(err) 
									console.log(err);						
								tagID = recordset.recordset[0].tagID;
								res.end(tagID.toString());		
							});
						}	
					});
				}
			}).catch(function (e){
					console.log(e);
			});	
			
			
		});	
		router.post('/delEvtpgTag', function (req, res) {
			var evtpgID =  req.body.evtpgID;
			var tagID =  req.body.tagID;
			db.query("DELETE FROM dm_EvtpgTag where evtpgID ="+evtpgID +" and tagID = "+tagID ,function(err,recordset){
				if(err) console.log(err);
				res.end('ok');
			});		
		});	
		router.get('/EvtpgAdd', function (req, res) {
			var modellist = req.session["modellist"]  ;
			var menudisplay = req.session["menuJson"]  ;
			var funcCatge ='';
			if( req.session.userid && req.session.userid != ''){
					db.query("SELECT codeValue,codeLabel FROM sy_CodeTable where codeGroup = 'funcCatge'  order by codeValue desc ",function(err,recordset){
						if(err) console.log(err);
						funcCatge = recordset.recordset ;
						res.render('EvtpgAdd', {'id' : req.session.userid,'funcCatge' : funcCatge, 'modellist' :JSON.stringify(modellist), 'menuJson':JSON.stringify(menudisplay) });
					});		
			}
			else{
				res.render('index', {'title' : req.session.userid});
			}
        });
		router.get('/EvtpgSearch', function (req, res) {
			var funcCatge ;
			var modellist = req.session["modellist"]  ;
			var menudisplay = req.session["menuJson"]  ;
			if( req.session.userid && req.session.userid != ''){
				var p1 = new Promise(function(resolve, reject){db.query("SELECT codeValue,codeLabel FROM sy_CodeTable where codeGroup = 'funcCatge' order by codeValue desc ",function(err,recordset){
							if(err) {
								console.log(err);
								reject(2);
							}
							funcCatge = recordset.recordset;
							resolve(1);
						});
				});
				Promise.all([p1]).then(function (results) {
						res.render('EvtpgSearch', {'id' : req.session.userid, 'modellist' :JSON.stringify(modellist), 'menuJson':JSON.stringify(menudisplay),'funcCatge':funcCatge});
						}).catch(function (e){
							console.log(e);
				});	
				
			}
			else{
				res.render('index', {'title' : req.session.userid});
			}
        });
		router.get('/EvtpgEdit', function (req, res) {
			var evtpgID =  req.query.evtpgID;
			var modellist = req.session["modellist"]  ;
			var menudisplay = req.session["menuJson"]  ;
			var maininfo = '';
			var atag ;
			var mtag ;
			if( req.session.userid && req.session.userid != ''){
				var p1 = new Promise(function(resolve, reject){db.query("SELECT evtpgID,client,sc.codeLabel,url,convert(varchar, sdt, 111)sdt,convert(varchar, edt, 111)edt,msm_tpc,convert(varchar, trkSdt, 111)trkSdt,convert(varchar, trkEdt, 111)trkEdt,evtpgDesc,isDel,convert(varchar, crtTime, 120)crtTime,convert(varchar, dem.updTime, 120)updTime,dem.updUser,(select count(*)  from dm_EvtadMst where evtpgID = dem.evtpgID) adCount,(SELECT count (distinct deam.evtadID) FROM dm_EvtadMst deam ,dm_EvtadTag det where deam.evtadID = det.evtadID and (det.isDel is null  or det.isDel <>'Y') and dem.evtpgID = deam.evtpgID)adtagcount,(select top 1 convert(varchar, deam.updTime, 120)  from dm_EvtadMst deam where deam.evtpgID = dem.evtpgID order by deam.updTime desc )adudtime,(select top 1 deam.updUser  from dm_EvtadMst deam where deam.evtpgID = dem.evtpgID order by deam.updTime desc )aduduser FROM dm_EvtpgMst dem left join sy_CodeTable sc on sc.codeGroup ='funcCatge' and sc.codeValue = dem.funcCatge where evtpgID ="+evtpgID,function(err,recordset){
							if(err) {
								console.log(err);
								reject(2);
							}
							maininfo = recordset.recordset;
							resolve(1);
						});
				});
				var p2 = new Promise(function(resolve, reject){db.query("SELECT evtpgID,tagID,tagLabel,tagSource,isDel FROM dm_EvtpgTag where (isDel is null  or isDel <>'Y' ) and tagSource ='m' and evtpgID = "+evtpgID,function(err,recordset){
							if(err) {
								console.log(err);
								reject(2);
							}
							mtag = recordset.recordset;
							resolve(1);
						});
				});
				var p3 = new Promise(function(resolve, reject){db.query("SELECT evtpgID,tagID,tagLabel,tagSource,isDel FROM dm_EvtpgTag where (isDel is null  or isDel <>'Y' ) and tagSource ='a' and evtpgID = "+evtpgID,function(err,recordset){
							if(err) {
								console.log(err);
								reject(2);
							}
							atag = recordset.recordset;
							resolve(1);
						});
				});
				Promise.all([p1,p2,p3]).then(function (results) {
						res.render('EvtpgEdit', {'id' : req.session.userid, 'modellist' :JSON.stringify(modellist), 'menuJson':JSON.stringify(menudisplay),'atag':atag,'mtag':mtag,'maininfo':maininfo,'evtpgID':evtpgID});
						}).catch(function (e){
							console.log(e);
				});	
				
			}
			else{
				res.render('index', {'title' : req.session.userid});
			}
        });
		router.post('/EvtpgAddact', function (req, res) {
			var modellist = req.session["modellist"]  ;
			var menudisplay = req.session["menuJson"]  ;
			var values = 'values(';
			var client =  req.body.client ||'' ;
			values+= "'"+client+"',";
			var funcCatge =  req.body.funcCatge ||'' ;
			values+= "'"+funcCatge+"',";
			var msm_tpc = req.body.msm_tpc ||'';
			values+= "'"+msm_tpc+"',";
			var url = req.body.url || '';
			values+= "'"+url+"',";
			var sdt =  req.body.sdt ||'' ;
			values+= "'"+sdt+"',";
			var edt =  req.body.edt ||'' ;
			if( edt == '' ) 
				values+= "null";
			else 
				values+= "'"+edt+"',";
			var trkSdt =  req.body.trkSdt ||'' ;
			values+= "'"+trkSdt+"',";
			var trkEdt =  req.body.trkEdt ||'' ;
			if(trkEdt == trkSdt) 
				values+= "'"+trkEdt+"',";
			else 
				values+= "'"+trkEdt+"',";
			var isDel =  req.body.isDel ||'' ;
			if( isDel == 'on')
				isDel = 'Y';
			else
				isDel = 'N';
			values+= "'"+isDel+"',";
			var evtpgDesc =  req.body.evtpgDesc ||'' ;
			values+= "'"+evtpgDesc+"',"
			values+="getdate(),getdate(),'"+req.session.userid+"')";
			var evtpgID = '';
			if( req.session.userid && req.session.userid != ''){
				var p1 = new Promise(function(resolve, reject){db.query("INSERT INTO dm_EvtpgMst(client,funcCatge,msm_tpc,url,sdt,edt,trkSdt,trkEdt,isDel,evtpgDesc,crtTime,updTime,updUser)"+values ,function(err,recordset){
							if(err) {
								console.log(err);
								reject(2);
							}
							resolve(1);
						});
				});
				Promise.all([p1]).then(function (results) {
					db.query("SELECT Top 1 evtpgID FROM dm_EvtpgMst order by evtpgID desc ",function(err,recordset){
							if(err) 
								console.log(err);						
							evtpgID = recordset.recordset[0].evtpgID;
							res.redirect('/Evtpg/EvtpgEdit?evtpgID='+evtpgID);		
					});
						
						}).catch(function (e){
							console.log(e);
				});	
				
			}
			else{
				res.render('index', {'title' : req.session.userid});
			}
        });
		router.post('/EvtpgList', function (req, res) {
			var modellist = req.session["modellist"]  ;
			var menudisplay = req.session["menuJson"]  ;
			var client =  req.body.client ||'' ;
			var funcCatge =  req.body.funcCatge ||'' ;
			var sdt =  req.body.sdt ||'' ;
			var edt =  req.body.edt ||'' ;
			var tpc =  req.body.tpc ||'' ;
			var sql = '';
			var maininfo =[] ;
			var data =[] ;
			var mainifolist =[] ;
			var taginfo = [] ;
			var adlist = [] ;
			var ad = [] ;
			var where = " where 1 = 1 and dem.client = '"+client+"' " ;
			if( funcCatge != '' )
				where += " and dem.funcCatge = '"+funcCatge+ "' " ;
			if( sdt != '' )
				where += " and dem.sdt >= '"+sdt+" 00:00:00' ";
			if( edt != '' )
				where += " and dem.edt <= '"+edt+" 23:59:59' ";
			if( tpc != '' )
				where += " and dem.msm_tpc like '%"+tpc+ "%' " ;
			
			
			if( req.session.userid && req.session.userid != ''){
				var p1 = new Promise(function(resolve, reject){db.query("SELECT ROW_NUMBER() OVER (ORDER BY dem.sdt ASC) as no, evtpgID,client,sc.codeLabel,url,convert(varchar, sdt, 120)sdt,convert(varchar, edt, 120)edt,msm_tpc,convert(varchar, dem.updTime, 120)updTime,(select count(*)  from dm_EvtadMst where evtpgID = dem.evtpgID) adCount,(SELECT count (distinct deam.evtadID) FROM dm_EvtadMst deam ,dm_EvtadTag det where deam.evtadID = det.evtadID and (det.isDel is null  or det.isDel <>'Y') and dem.evtpgID = deam.evtpgID)adtagcount FROM dm_EvtpgMst dem left join sy_CodeTable sc on sc.codeGroup = 'funcCatge' and sc.codeValue = dem.funcCatge " +where+" order by dem.sdt asc " ,function(err,recordset){
						if(err) {
							console.log(err);
							reject(2);
						}
						for( var i = 0 ; i < recordset.rowsAffected  ; i++) {
							maininfo = [] ;
							maininfo.push({
								no: recordset.recordset[i].no,
								evtpgID : recordset.recordset[i].evtpgID,
								client : recordset.recordset[i].client,
								codeLabel : recordset.recordset[i].codeLabel,
								sdt : recordset.recordset[i].sdt,
								edt : recordset.recordset[i].edt,
								msm_tpc : recordset.recordset[i].msm_tpc,
								adCount : recordset.recordset[i].adCount,
								adtagcount : recordset.recordset[i].adtagcount,
								updTime:recordset.recordset[i].updTime,
								url:recordset.recordset[i].url
							});
							data.push({
								maininfo:maininfo
							});
						}
						resolve(1);
					});
				});
				var p2 = new Promise(function(resolve, reject){db.query("SELECT ROW_NUMBER() OVER (ORDER BY a.adSdt ASC) as no,a.*, (select count(*) from dm_EvtadTag b where a.evtadID = b.evtadID) sumtag FROM dm_EvtadMst a order by a.adSdt asc " ,function(err,recordset){
						if(err) {
							console.log(err);
							reject(2);
						}
						for( var i = 0 ; i < recordset.rowsAffected  ; i++) {
							ad.push({
								no: recordset.recordset[i].no,
								evtadID : recordset.recordset[i].evtadID,
								evtpgID : recordset.recordset[i].evtpgID,
								adSource : recordset.recordset[i].adSource,
								adChannel : recordset.recordset[i].adChannel,
								adPos : recordset.recordset[i].adPos,
								adSize : recordset.recordset[i].adSize,
								sumtag : recordset.recordset[i].sumtag
							
							});
						}	
						resolve(1);
					});
				});
				Promise.all([p1,p2]).then(function (results) {
					db.query("SELECT det.evtpgID,det.tagID,det.tagLabel,det.tagSource FROM dm_EvtpgTag det where  det.evtpgID in( SELECT dem.evtpgID FROM dm_EvtpgMst dem "+where+" ) and ( isDel is null or isDel <>'Y') " ,function(err,recordset){
						if(err) 
							console.log(err);
						for( var i = 0 ; i < data.length ; i++ ) {
							taginfo = [] ;
							for( var j = 0 ; j < recordset.rowsAffected  ; j++) {
								if( data[i].maininfo[0].evtpgID == recordset.recordset[j].evtpgID ) {
									taginfo.push({
										tag:recordset.recordset[j].tagLabel
									});
								}
								
							}
							data[i].maininfo.push({
									taginfo:taginfo
								});
						}
						for( var i = 0 ; i < data.length ; i++ ) {
							adlist = [];
							for( var j = 0 ; j < ad.length ; j++ ) {
								if( data[i].maininfo[0].evtpgID == ad[j].evtpgID) {
									adlist.push({
										ad:ad[j]
									});
								}
							}
							data[i].maininfo.push({
									adlist:adlist
								});
						}
						console.log(JSON.stringify(data));
						res.render('EvtpgList', {'id' : req.session.userid, 'items' : recordset.recordset, 'modellist' :JSON.stringify(modellist), 'menuJson':JSON.stringify(menudisplay),'data':JSON.stringify(data)});
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
    return EvtpgRoute;
}(Route_1.BaseRoute));
exports.EvtpgRoute = EvtpgRoute;


