"use strict";
const express = require("express");
const winston = require('winston');
const _ = require("lodash");
const db = require("../utils/sql-server-connector").db;

module.exports = (app) => {
  console.log('[LoginRoute::create] Creating index route.');
  var router = express.Router();

  router.get('/logout', function (req, res) {
    var userId = req.body.userId || '';
    var password = req.body.password || '';
    req.session.userid = "";
    res.redirect('/');

  });

  router.get('/login', function (req, res) {
    res.render('index', {
      layout: 'layout-login'
    });
  });

  router.post('/login', function (req, res) {
    var uID = '';
    var userId = req.body.userId || '';
    var password = req.body.password || '';
    var where = " where userId ='" + userId + "' and + password = '" + password + "'";
    //var model=[] ;
    //var modelList =[];
    db.query('select * from sy_infouser' + where, function (err, recordset) {
      if (err) console.log(err);
      if (recordset.rowsAffected == 0) {
        res.locals.error = '使用者帳號或密碼錯誤';
        var errormsg = 'YES';
        res.render('index', {
          errormsg: errormsg
        });
      } else {
        req.session.uID = recordset.recordset[0].uID;
        req.session.userid = userId;
        var p1 = new Promise(function (resolve, reject) {
          db.query("update sy_infouser set loginTime = GETDATE() where userId = '" + userId + "'", function (err, result) {
            if (err) {
              //console.log(err);
              reject(err);
            }
            resolve(result.recordset);
          });
        });

        //建立各個menu的權限
        var p2 = new Promise(function (resolve, reject) {
          db.query("SELECT syuw.userId,syuw.ugrpId ,sym.menuCode,syu.isRead,syu.isEdit,syu.isDownload FROM sy_userWithUgrp syuw left join sy_ugrpcode syu on syu.ugrpId = syuw.ugrpId left join sy_menu sym on sym.menuId = syu.menuId and sym.parentId is not null where userId = '" + userId + "' order by sym.menuId asc", function (err, result) {
            if (err) {
              //console.log(err);
              reject(err);
            }
            let permission = result.recordset.reduce((accumulator, value, index) => {
              if (!accumulator[value.menuCode]) {
                accumulator[value.menuCode] = {}
              }
              accumulator[value.menuCode].read = accumulator[value.menuCode].read || (value.isRead === 'Y');
              accumulator[value.menuCode].edit = accumulator[value.menuCode].edit || (value.isEdit === 'Y');
              accumulator[value.menuCode].download = accumulator[value.menuCode].download || (value.isDownload === 'Y');
              return accumulator;
            }, {});
						/*
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
						*/
            resolve(permission);
          });
        });
        var p3 = new Promise(function (resolve, reject) {
          db.query("SELECT mdID,mdName,batID FROM md_Model order by updTime desc ", function (err, result) {
            if (err) {
              //console.log(err);
              reject(err);
            }
            let modelList = result.recordset.map((row, index) => {
              return {
                mdID: row.mdID,
                mdName: row.mdName,
                batID: row.batID
              };
            });
						/*
						for( var i = 0 ; i < recordset.rowsAffected ; i++){
							model.push({
								mdID : recordset.recordset[i].mdID,
								mdName : recordset.recordset[i].mdName,
								batID : recordset.recordset[i].batID
							});
							modelList.push({
								model
							});
							model = [];
						}
						*/
            resolve(modelList);
          });

        });

        Promise.all([p1, p2, p3]).then(function (results) {
          let permission = results[1];
          let modelList = results[2];
          let navMenuList = [];
          let mgrMenuList = [];
          db.query('SELECT sm.menuCode,sm.parentId,sm.menuName,sm.modifyDate,sm.modifyUser,sm.url, sm.sticky,pym.menuName premenuName, pym.menuCode preMenuCode, pym.sticky preSticky FROM sy_menu sm left join sy_menu pym on sm.parentId = pym.menuId where sm.parentId is not null', function (err, result) {
            console.log('===permission: ', permission);
            for (let menu of result.recordset) {
              let pointer = (menu.preSticky === '_mgr') ? mgrMenuList : navMenuList;
              if (permission[menu.menuCode] && permission[menu.menuCode].read) {
                let parent = _.find(pointer, { menuCode: menu.preMenuCode });
                if (!parent) {
                  parent = {
                    menuCode: menu.preMenuCode,
                    mainMenu: menu.premenuName,
                    _model: (menu.preSticky === '_model'),
                    _mgr: (menu.preSticky === '_mgr'),
                    childMenu: []
                  };
                  pointer.push(parent);
                }
                parent.childMenu.push({
                  menuName: menu.menuName,
                  url: menu.url,
                  sticky: menu.sticky,
                  menuCode: menu.menuCode
                });
              }
            }

						/*
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
									navMenuList.push({
										mainMenu : premenuName ,
										childMenu : menu
									});
								}
								else if( premenuName != recordset.recordset[i].premenuName && premenuName != '' && i < recordset.rowsAffected - 1) {
									navMenuList.push({
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
									navMenuList.push({
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
									navMenuList.push({
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
									navMenuList.push({
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
									navMenuList.push({
										mainMenu : premenuName ,
										childMenu : menu
									});
								}
							}
						}
						*/
            req.session.permission = permission;
            req.session.modelList = modelList;
            req.session.navMenuList = navMenuList;
            req.session.mgrMenuList = mgrMenuList[0];
            res.redirect('/');
            //res.render('main', {'id' : req.session.userid, 'navMenuList' : navMenuList,'modelList' :modelList});
          });
        }).catch(function (e) {
          console.log(e);
        });
      }
    });
  });
  return router;
};
/*
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
		router.get('/login', function(req, res) {
			res.render('index');
		});
        router.post('/login', function (req, res) {
            var uID ='';
            var userId =  req.body.userId ||'' ;
			var password = 	req.body.password ||'' ;
			var where = " where userId ='" +userId + "' and + password = '" + password + "'";
			var model=[] ;
			var modelList =[];
			db.query('select * from sy_infouser' + where ,function(err,recordset){
				if(err) console.log(err);
				if( recordset.rowsAffected == 0 ) {
					res.locals.error = '使用者帳號或密碼錯誤';
					var errormsg = 'YES';
					res.render('index',{errormsg:errormsg});
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
					var p3 = new Promise(function(resolve, reject){db.query("SELECT mdID,mdName,batID FROM md_Model order by updTime desc ",function(err,recordset){
							if(err) {
								console.log(err);
								reject(3);
							}
							for( var i = 0 ; i < recordset.rowsAffected ; i++){
								model.push({
									mdID : recordset.recordset[i].mdID,
									mdName : recordset.recordset[i].mdName,
									batID : recordset.recordset[i].batID
								});
								modelList.push({
									model
								});
								model = [];
							}
							resolve(1);
						});
							
					});
					
					Promise.all([p1, p2, p3]).then(function (results) {
						db.query('SELECT sm.menuId,sm.parentId,sm.menuName,sm.modifyDate,sm.modifyUser,sm.url,sm.menuClass,pym.menuName premenuName FROM sy_menu sm left join sy_menu pym on sm.parentId = pym.menuId where sm.parentId is not null' ,function(err,recordset){
							var navMenuList = [];
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
										navMenuList.push({
											mainMenu : premenuName ,
											childMenu : menu
										});
									}
									else if( premenuName != recordset.recordset[i].premenuName && premenuName != '' && i < recordset.rowsAffected - 1) {
										navMenuList.push({
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
										navMenuList.push({
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
										navMenuList.push({
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
										navMenuList.push({
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
										navMenuList.push({
											mainMenu : premenuName ,
											childMenu : menu
										});
									}
								}
							}
							req.session["modelList"] = modelList ;
							req.session["navMenuList"] = navMenuList ;
							res.redirect('/');
							//res.render('main', {'id' : req.session.userid, 'navMenuList' : navMenuList,'modelList' :modelList});
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
*/
//# sourceMappingURL=Index.js.map
