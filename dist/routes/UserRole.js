"use strict";
var config  = require("../configuration/newconfig");
var db = config.db;
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Route_1 = require("./Route");

var userRoleinfoRoute = (function (_super) {
    __extends(userRoleinfoRoute, _super);
    function userRoleinfoRoute() {
        return _super.call(this) || this;
    }
    userRoleinfoRoute.create = function (router) {
        console.log('[userRoleRoute::create] Creating userRole route.');
		router.post('/checkEditAuthority', function (req, res) {
			if( req.session.userRole_Edit == 'Y') 
				res.end("ok");
			else
				res.end("no");
			
        });
		router.post('/UserRoleAddAct', function (req, res) {
			if( req.session.userid && req.session.userid != ''){
				if( req.session.userRole_Edit == 'Y' ) {
					var ugrpId  ;
					var ugrpClass = req.body.ugrpClass ||'' ;
					var ugrpName = req.body.ugrpName ||'' ;
					var remark = req.body.remark ||'' ;
					var isstop = req.body.isstop ||'' ;
					var checked ='N';
					if (isstop =='on')
						checked ='Y';
					var p1 = new Promise(function(resolve, reject){db.query("INSERT INTO sy_ugrp(ugrpClass,ugrpName,remark,regdate,modifyDate,signer,isStop) values('"+ugrpClass+"','"+ugrpName+"','"+remark+"',GETDATE(),GETDATE(),'"+req.session.userid+"','"+checked+"')" ,function(err,recordset){
							if(err) {
								console.log(err);
								reject(2);
							}
							
							resolve(1);
						
						});
					});
					Promise.all([p1]).then(function (results) {
							db.query('select top 1 ugrpId from sy_ugrp order by ugrpId desc ' ,function(err,recordset){	
								if(err) console.log(err);
								res.redirect('/userRole/UserRoleInfoEdit?ugrpId='+recordset.recordset[0].ugrpId);
							});
						}).catch(function (e){
							console.log(e);
					});	
				}
			}
			else{
				res.render(VIEW + 'index', {'title' : req.session.userid, 'items' : ""});
			}
        });
		router.get('/userRoleAdd', function (req, res) {
			if( req.session.userid && req.session.userid != ''){
				if( req.session.userRole_Edit == 'Y' ) {
					db.query("SELECT * FROM sy_ugrpClass",function(err,recordset){
						if(err) console.log(err);
						var modellist = req.session["modellist"]  ;
						var menudisplay = req.session["menuJson"]  ;
						res.render(VIEW + 'userRoleAdd', {'id' : req.session.userid,'ugrpClass' : recordset.recordset, 'modellist' :JSON.stringify(modellist), 'menuJson':JSON.stringify(menudisplay) });
					});
				}
				else{
					res.render(VIEW + 'main', {'id' : req.session.userid});
				}
			}
			else{
				res.render(VIEW + 'main', {'title' : req.session.userid});
			}
        });
		router.get('/userRoleSearch', function (req, res) {
			if( req.session.userid && req.session.userid != ''){
				var modellist = req.session["modellist"]  ;
				var menudisplay = req.session["menuJson"]  ;
				res.render(VIEW + 'userRoleSearch', {'id' : req.session.userid, 'modellist' :JSON.stringify(modellist), 'menuJson':JSON.stringify(menudisplay)});
			}
			else{
				res.render(VIEW + 'index', {'title' : req.session.userid});
			}
        });
		router.post('/userRoleList', function (req, res) {
			var ugrpName = req.body.ugrpName ||'' ;
			var where = " where 1=1 " ;
			if( ugrpName != '' )
				where += " and ugrpName like '%"+ugrpName+"%' " ;
			if( req.session.userid && req.session.userid != ''){
				if( req.session.userRole_Read == 'Y'){ 
					db.query("SELECT  ROW_NUMBER() OVER (ORDER BY uc.ugrpClassId ASC) as no ,ugrpId,ugrpClass,ugrpName,uc.ugrpClassName,isStop FROM sy_ugrp ug left join sy_ugrpClass uc on uc.ugrpClassId = ug.ugrpClass" +where+" order by uc.ugrpClassId asc" ,function(err,recordset){
						if(err) console.log(err);
					//send records as a respons
						var modellist = req.session["modellist"]  ;
						var menudisplay = req.session["menuJson"]  ;
						res.render(VIEW + 'userRoleList', {'id' : req.session.userid, 'items' : recordset.recordset, 'modellist' :JSON.stringify(modellist), 'menuJson':JSON.stringify(menudisplay)});
					});
				}
				else{
					res.render(VIEW + 'main', {'id' : req.session.userid, 'items' : ""});
				}
			}
			else{
				res.render(VIEW + 'index', {'title' : req.session.userid, 'items' : ""});
			}
        });
		router.post('/delAuthority', function (req, res) {
			if( req.session.userid && req.session.userid != ''){
				if( req.session.userRole_Edit == 'Y' ) {
					var ugrpId = req.body.ugrpId ||'' ;
					var menuId = req.body.menuId ||'' ;
					db.query("delete from sy_ugrpcode where ugrpId ="+ugrpId+" and menuId = "+menuId ,function(err,recordset){
						if(err) console.log(err);
						//send records as a respons
							res.end('ok');
			
					});
				}
				else{
					res.render(VIEW + 'index', {'id' : req.session.userid, 'items' : ""});
				}
			}
			else{
				res.render(VIEW + 'index', {'title' : req.session.userid, 'items' : ""});
			}
        });
		router.post('/addAuthority', function (req, res) {
            var ugrpId = req.body.ugrpId ||'' ;
			var menuId = req.body.menuId ||'' ;
			var all = req.body.all ||'' ;
			var Read = req.body.Read ||'' ;
			var Edit = req.body.Edit ||'' ;
			var Download = req.body.Download ||'' ;
			if( all == "true")
				all = 'Y';
			else 
				all = 'N' ;
			if( Read == "true" )
				Read = 'Y';
			else 
				Read = 'N' ;
			if( Edit == "true" )
				Edit = 'Y';
			else 
				Edit = 'N' ;
			if( Download == "true")
				Download = 'Y';
			else 
				Download = 'N' ;
			function addAuthority(ugrpId,menuId,all,Read,Edit,Download,callback){
				var where = " where ugrpId = "+ugrpId+" and menuId ="+menuId ;
				db.query('select count(*) total from sy_ugrpcode' + where ,function(err,recordset){
					if (err) 
						callback(err, null);
					else 
						callback(null, recordset.recordset[0].total);
				});
			}
			addAuthority(ugrpId,menuId,all,Read,Edit,Download,function(err,data){
				if (err) 
					console.log("ERROR : ",err);
				else if ( data != 0) {
					var where = " where ugrpId = "+ugrpId+" and menuId ="+menuId ; 
					db.query("update sy_ugrpcode set isAll = '"+all+ "',isRead = '"+Read+ "',isEdit = '"+Edit+"',isDownload = '"+Download+"',modifyDate = GETDATE(),modifyUser ='"+req.session.userid+"'"+ where ,function(err,recordset){
						if (err) 
							console.log("ERROR : ",err);
						res.end('更新成功');
					});
				}
				else {
					var values = "VALUES("+ugrpId+","+menuId+",GETDATE(),GETDATE(),'"+req.session.userid+"','"+all+"','"+Read+"','"+Edit+"','"+Download+"')"
					db.query("INSERT INTO sy_ugrpcode(ugrpId,menuId,modifyDate,regDate,modifyUser,isAll,isRead,isEdit,isDownload)"+values ,function(err,recordset){
						if (err) 
							console.log("ERROR : ",err);
						res.end('新增成功');
					});
				}
			});
        });
		router.post('/UserGroupInfoEditAct', function (req, res) {
			if( req.session.userid && req.session.userid != ''){
				var ugrpId = req.body.ugrpId ||'' ;
				var ugrpClass = req.body.ugrpClass ||'' ;
				var ugrpName = req.body.ugrpName ||'' ;
				var remark = req.body.remark ||'' ;
				var isstop = req.body.isstop ||'' ;
				var checked ='N';
				if (isstop =='on')
					checked ='Y';
				var where = " where ugrpId ='" +ugrpId + "'";
				console.log(ugrpId);
				db.query("update sy_ugrp set ugrpClass = '"+ugrpClass+"', ugrpName = '"+ugrpName+"', remark = '"+remark+"', signer ='"+req.session.userid+"',modifyDate=GETDATE(),isStop = '"+checked+"'" + where ,function(err,recordset){
					if(err) console.log(err);
					//send records as a respons
						res.redirect('/userRole/UserRoleInfoEdit?ugrpId='+ugrpId);
			
				});
			}
			else{
				res.render(VIEW + 'index', {'title' : req.session.userid, 'items' : ""});
			}
        });
        router.get('/UserRoleInfoEdit', function (req, res) {
			if( req.session.userid && req.session.userid != ''){
				if( req.session["userRole_Read"] == 'Y' ) {
					var ugrpId = req.query.ugrpId ||'' ;
					var where = " where ug.ugrpId ='" +ugrpId + "'";
					var checked;
					var ugrpClass;
					var authority;
					var items ;
					var menuJson = [];
					var menu = [];
					var premenuName = '';
					var menuClass ;
					var p1 = new Promise(function(resolve, reject){db.query("SELECT ROW_NUMBER() OVER (ORDER BY ugrpId ASC) as no, ugrpId ,su.menuId,convert(varchar, su.modifyDate, 120)modifyDate,convert(varchar, regDate, 120)regDate,su.modifyUser,isRead,isEdit,isDownload,isAll,sm.menuName,sme.menuName pName FROM sy_ugrpcode su left join sy_menu sm on sm.menuId = su.menuId and sm.parentId is not null left join sy_menu sme on sme.menuId = sm.parentId and sme.parentId is null where su.ugrpId = "+ugrpId +" order by su.menuId asc ",function(err,recordset){
							if(err) {
								console.log(err);
								reject(2);
							}
							authority = recordset.recordset;
							resolve(1);
						});
					});
					var p2 = new Promise(function(resolve, reject){db.query("SELECT sm.menuId,sm.parentId,sm.menuName,s.menuName premenuName FROM sy_menu sm left join sy_menu s on s.menuId = sm.parentId where sm.parentId is not null order by sm.parentId asc",function(err,recordset){
							if(err) {
								console.log(err);
								reject(2);
							}
							for( var i = 0 ;  i < recordset.rowsAffected ; i++){
								if( premenuName == recordset.recordset[i].premenuName && i < recordset.rowsAffected - 1  ) {
									menu.push({
										menuName : recordset.recordset[i].menuName,
										menuId : recordset.recordset[i].menuId		
									});
								}
								else if( premenuName == recordset.recordset[i].premenuName && i == recordset.rowsAffected - 1  ) {
									menu.push({
										menuName : recordset.recordset[i].menuName,
										menuId : recordset.recordset[i].menuId		
									});
									menuJson.push({
										mainMenu : premenuName ,
										childMenu : menu
									});
								}
								else if( premenuName != recordset.recordset[i].premenuName && premenuName != '' && i < recordset.rowsAffected - 1) {
									menuJson.push({
										mainMenu : premenuName ,
										childMenu : menu
									});
									menu = [];
									premenuName = recordset.recordset[i].premenuName;
									menu.push({
										menuName : recordset.recordset[i].menuName,
										menuId : recordset.recordset[i].menuId		
									});
								}
								else if( premenuName != recordset.recordset[i].premenuName && premenuName != '' && i == recordset.rowsAffected - 1) {
									menuJson.push({
										mainMenu : premenuName ,
										childMenu : menu
									});
									menu = [];
									premenuName = recordset.recordset[i].premenuName;
									menu.push({
										menuName : recordset.recordset[i].menuName,
										menuId : recordset.recordset[i].menuId		
									});
									menuJson.push({
										mainMenu : premenuName ,
										childMenu : menu
									});
								}
								else if( premenuName != recordset.recordset[i].premenuName && premenuName == '' && i == recordset.rowsAffected - 1) {
									premenuName = recordset.recordset[i].premenuName;
									menu.push({
										menuName : recordset.recordset[i].menuName,
										menuId : recordset.recordset[i].menuId		
									});
									menuJson.push({
										mainMenu : premenuName ,
										childMenu : menu
									});
								}
								else if( premenuName != recordset.recordset[i].premenuName && premenuName == '' && i < recordset.rowsAffected - 1) {
									premenuName = recordset.recordset[i].premenuName;
									menu.push({
										menuName : recordset.recordset[i].menuName,
										menuId : recordset.recordset[i].menuId		
									});
								}
							}
							
							resolve(5);
						});
					});
					var p3 = new Promise(function(resolve, reject){db.query('select * from sy_ugrpClass' ,function(err,recordset){
							if(err) {
								console.log(err);
								reject(2);
							}
							ugrpClass = recordset.recordset;
							resolve(6);
						});
					});
					var p4 = new Promise(function(resolve, reject){db.query('select ug.ugrpId,ug.ugrpName,ug.remark,convert(varchar, ug.regdate, 120)regdate ,ug.ugrpClass,convert(varchar, ug.modifyDate, 120)modifyDate,ug.signer,ug.isStop,ugc.ugrpClassName from sy_ugrp ug LEFT JOIN sy_ugrpClass ugc on ugc.ugrpClassId = ug.ugrpClass' + where ,function(err,recordset){
							if(err) {
								console.log(err);
								reject(2);
							}
							items = recordset.recordset;
							//send records as a respons
							if( recordset.recordset[0].isStop == 'Y')
								checked = 'checked';
							else 
								checked = '' ;
							resolve(7);				
						});	
					});	
					Promise.all([p1, p2, p3, p4]).then(function (results) {
						var modellist = req.session["modellist"]  ;
						var menudisplay = req.session["menuJson"]  ;
						res.render(VIEW + 'UserGroupInfoEdit', {'id' : req.session.userid, 'items' : items,'checked' : checked,'ugrpClass' : ugrpClass, 'menu' : JSON.stringify(menuJson),'authority' : authority, 'modellist' :JSON.stringify(modellist), 'menuJson':JSON.stringify(menudisplay)});
						}).catch(function (e){
							console.log(e);
					});	
				}
				else {
					console.log("失敗");
					res.render(VIEW + 'main', {'id' : req.session.userid, 'items' : ""});
				}
			}
			else{
				res.render(VIEW + 'index', {'title' : req.session.userid, 'items' : ""});
			}
		});
    };
    return userRoleinfoRoute;
}(Route_1.BaseRoute));
exports.userRoleinfoRoute = userRoleinfoRoute;


