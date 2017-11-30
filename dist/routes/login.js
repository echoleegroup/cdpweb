"use strict";
var db  = require("../utils/sql-server-connector").db;
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Route_1 = require("./Route");
var LoginRoute = (function (_super) {
    __extends(LoginRoute, _super);
    function LoginRoute() {
        return _super.call(this) || this;
    }
    LoginRoute.create = function (router) {
        console.log('[LoginRoute::create] Creating index route.');
		router.get('/logout', function (req, res) {
            var userId =  req.body.userId ||'' ;
			var password = 	req.body.password ||'' ;
			req.session.userid = "";
			res.redirect('..');
			
        });
        router.post('/login', function (req, res) {
            var uID ='';
            var userId =  req.body.userId ||'' ;
			var password = 	req.body.password ||'' ;
			var where = " where userId ='" +userId + "' and + password = '" + password + "'";
			var model=[] ;
			var modellist =[];
			db.query('select * from sy_infouser' + where ,function(err,recordset){
				if(err) console.log(err);
				if( recordset.rowsAffected == 0 ) {
					res.locals.error = '使用者帳號或密碼錯誤';
					var errormsg = 'YES';
					res.render('index.hbs',{errormsg:errormsg});
				}
				else{
				    req.session.uID = recordset.recordset[0].uID;
					req.session.userid = userId ;
					var p1 = new Promise(function(resolve, reject){db.query("update sy_infouser set loginTime = GETDATE() where userId = '" +userId + "'" ,function(err,recordset){
							if(err) { 
								console.log(err);
								reject(2);
							}
							resolve(1);
						});
					});
					
					//建立各個menu的權限
					var p2 = new Promise(function(resolve, reject){db.query("SELECT syuw.userId,syuw.ugrpId ,sym.menuId,syu.isRead,syu.isEdit,syu.isDownload,sym.menuClass FROM sy_userWithUgrp syuw left join sy_ugrpcode syu on syu.ugrpId = syuw.ugrpId left join sy_menu sym on sym.menuId = syu.menuId and sym.parentId is not null where userId = '"+userId+"' order by sym.menuId asc",function(err,recordset){
							if(err) {
								console.log(err);
								reject(3);
							}
							var menuClass ;
							for( var i = 0 ; i < recordset.rowsAffected ; i++){
								menuClass = recordset.recordset[i].menuClass;
								if( req.session[menuClass+"_Read"] != 'Y' ) {
									if( recordset.recordset[i].isRead == 'Y')
										req.session[menuClass+"_Read"] = 'Y' ;
									else
										req.session[menuClass+"_Read"] = 'N' ;
								}
								if( req.session[menuClass+"_Edit"] != 'Y' ) {
									if( recordset.recordset[i].isEdit == 'Y')
										req.session[menuClass+"_Edit"] = 'Y' ;
									else
										req.session[menuClass+"_Edit"] = 'N' ;
								}
								if( req.session[menuClass+"_Download"] != 'Y' ) {
									if( recordset.recordset[i].isDownload == 'Y')
										req.session[menuClass+"_Download"] = 'Y' ;
									else
										req.session[menuClass+"_Download"] = 'N' ;
								}
							}
							resolve(1);
						});
					});
					var p3 = new Promise(function(resolve, reject){db.query("SELECT mdID,mdName,batBinded FROM md_Model order by updTime desc ",function(err,recordset){
							if(err) {
								console.log(err);
								reject(3);
							}
							for( var i = 0 ; i < recordset.rowsAffected ; i++){
								model.push({
									mdID : recordset.recordset[i].mdID,
									mdName : recordset.recordset[i].mdName,
									batBinded : recordset.recordset[i].batBinded
								});
								modellist.push({
									model
								});
								model = [];
							}
							resolve(1);
						});
							
					});
					
					Promise.all([p1, p2, p3]).then(function (results) {
						db.query('SELECT sm.menuId,sm.parentId,sm.menuName,sm.modifyDate,sm.modifyUser,sm.url,sm.menuClass,pym.menuName premenuName FROM sy_menu sm left join sy_menu pym on sm.parentId = pym.menuId where sm.parentId is not null' ,function(err,recordset){
							var menuJson = [];
							var menu = [];
							var premenuName = '';
							var menuClass ;
							for( var i = 0 ;  i < recordset.rowsAffected ; i++){
								menuClass = recordset.recordset[i].menuClass;
								if( req.session[menuClass+"_Read"] == 'Y' ) {
									if( premenuName == recordset.recordset[i].premenuName && i < recordset.rowsAffected - 1  ) {
										menu.push({
											menuName : recordset.recordset[i].menuName,
											url : recordset.recordset[i].url,
											show : req.session[menuClass+"_Read"]									
										});
									}
									else if( premenuName == recordset.recordset[i].premenuName && i == recordset.rowsAffected - 1  ) {
										menu.push({
											menuName : recordset.recordset[i].menuName,
											url : recordset.recordset[i].url,
											show : req.session[menuClass+"_Read"]
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
											url : recordset.recordset[i].url,
											show : req.session[menuClass+"_Read"]
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
											url : recordset.recordset[i].url,
											show : req.session[menuClass+"_Read"]
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
											url : recordset.recordset[i].url,
											show : req.session[menuClass+"_Read"]
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
											url : recordset.recordset[i].url,
											show : req.session[menuClass+"_Read"]
										});
									}
								}	
								else {
									if(i == recordset.rowsAffected - 1 ){
										menuJson.push({
											mainMenu : premenuName ,
											childMenu : menu
										});
									}
								}
							}
							req.session["modellist"] = modellist ;
							req.session["menuJson"] = menuJson ;
							res.render('main', {'id' : req.session.userid, 'menuJson' : JSON.stringify(menuJson),'modellist' :JSON.stringify(modellist)});
						});
						}).catch(function (e){
						console.log(e);
					});		
				}
			});
        });
    };
    
    return LoginRoute;
}(Route_1.BaseRoute));
exports.LoginRoute = LoginRoute;

//# sourceMappingURL=Index.js.map
