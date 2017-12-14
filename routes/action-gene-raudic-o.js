"use strict";
const express = require('express');
const winston = require('winston');
const db = require("../utils/sql-server-connector").db;
var java_api_endpoint = require("../config/app-config").get("JAVA_API_ENDPOINT");

module.exports = (app) => {
	console.log('[generaudicRoute::create] Creating generaudic route.');
	const router = express.Router();

	router.get('/generaudicCP', function (req, res) {
		if (req.session.userid && req.session.userid != '') {
			var mdID = req.query.mdID || '';
			var batID = req.query.batID || '';
			var where = " where mdID = '" + mdID + "' and batID = '" + batID + "' ";
			var tacount = 0;
			var tapopcount = 0;
			var splcount = 0;
			var modelInfo;
			var mdListCategCount = [];
			var items;
			var p1 = new Promise(function (resolve, reject) {
				db.query("SELECT mdName,batID,splName,splDesc,popName,popDesc,taName,taDesc,convert(varchar, updTime, 111)updTime FROM md_Model where mdID ='" + mdID + "' and batID = '" + batID + "' ", function (err, recordset) {
					if (err) {
						console.log(err);
						reject(2);
					}
					modelInfo = recordset.recordset[0];
					resolve(1);
				});
			});
			var p2 = new Promise(function (resolve, reject) {
				db.query("SELECT count(*) total ,mdListCateg FROM md_ListDet WHERE batID = '" + batID + "' and mdID ='" + mdID + "' and (mdListCateg ='spl' or mdListCateg ='tapop' or  mdListCateg ='ta') group by mdListCateg ", function (err, recordset) {
					if (err) {
						console.log(err);
						reject(2);
					}
					for (var i = 0; i < recordset.rowsAffected; i++) {
						if (recordset.recordset[i].mdListCateg == 'spl') {
							var item1 = {
								"mdListCateg": "已購客群",
								"total": recordset.recordset[i].total
							}
							splcount = recordset.recordset[i].total;
						}
						else if (recordset.recordset[i].mdListCateg == 'tapop') {
							var item1 = {
								"mdListCateg": "潛在客群",
								"total": recordset.recordset[i].total
							}
							tapopcount = recordset.recordset[i].total;
						}
						else if (recordset.recordset[i].mdListCateg == 'ta') {
							var item1 = {
								"mdListCateg": "模型受眾",
								"total": recordset.recordset[i].total
							}
							tacount = recordset.recordset[i].total;
						}
						mdListCategCount.push(item1);
					}



					resolve(1);
				});
			});
			Promise.all([p1, p2]).then(function (results) {
				var modelList = req.session.modelList;
				var navMenuList = req.session.navMenuList;
				var mgrMenuList = req.session.mgrMenuList;
				res.render('generaudicCP', {
					'id': req.session.userid,
					'tacount': tacount,
					'mdListCategCount': JSON.stringify(mdListCategCount),
					'mdID': mdID,
					'batID': batID,
					'navMenuList': navMenuList,
					'modelList': modelList,
					'mgrMenuList': mgrMenuList,
					'tapopcount': tapopcount,
					'splcount': splcount,
					'api': java_api_endpoint,
					'modelInfo': modelInfo
				});

			}).catch(function (e) {
				console.log(e);

			});
		}
		else {
			res.render('index', { 'title': req.session.userid, 'items': "" });
		}
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
var generaudicRoute = (function (_super) {
	__extends(generaudicRoute, _super);
	function generaudicRoute() {
		return _super.call(this) || this;
	}
	generaudicRoute.create = function (router) {
		console.log('[generaudicRoute::create] Creating generaudic route.');
		router.get('/generaudicCP', function (req, res) {
			if (req.session.userid && req.session.userid != '') {
				var mdID = req.query.mdID || '';
				var batID = req.query.batID || '';
				var where = " where mdID = '" + mdID + "' and batID = '" + batID + "' ";
				var tacount = 0;
				var tapopcount = 0;
				var splcount = 0;
				var modelInfo;
				var mdListCategCount = [];
				var items;
				var p1 = new Promise(function (resolve, reject) {
					db.query("SELECT mdName,batID,splName,splDesc,popName,popDesc,taName,taDesc,convert(varchar, updTime, 111)updTime FROM md_Model where mdID ='" + mdID + "' and batID = '" + batID + "' ", function (err, recordset) {
						if (err) {
							console.log(err);
							reject(2);
						}
						modelInfo = recordset.recordset[0];
						resolve(1);
					});
				});
				var p2 = new Promise(function (resolve, reject) {
					db.query("SELECT count(*) total ,mdListCateg FROM md_ListDet WHERE batID = '" + batID + "' and mdID ='" + mdID + "' and (mdListCateg ='spl' or mdListCateg ='tapop' or  mdListCateg ='ta') group by mdListCateg ", function (err, recordset) {
						if (err) {
							console.log(err);
							reject(2);
						}
						for (var i = 0; i < recordset.rowsAffected; i++) {
							if (recordset.recordset[i].mdListCateg == 'spl') {
								var item1 = {
									"mdListCateg": "已購客群",
									"total": recordset.recordset[i].total
								}
								splcount = recordset.recordset[i].total;
							}
							else if (recordset.recordset[i].mdListCateg == 'tapop') {
								var item1 = {
									"mdListCateg": "潛在客群",
									"total": recordset.recordset[i].total
								}
								tapopcount = recordset.recordset[i].total;
							}
							else if (recordset.recordset[i].mdListCateg == 'ta') {
								var item1 = {
									"mdListCateg": "模型受眾",
									"total": recordset.recordset[i].total
								}
								tacount = recordset.recordset[i].total;
							}
							mdListCategCount.push(item1);
						}



						resolve(1);
					});
				});
				Promise.all([p1, p2]).then(function (results) {
					var modelList = req.session.modelList;
					var navMenuList = req.session.navMenuList;
					var mgrMenuList = req.session.mgrMenuList;
					res.render('generaudicCP', {
						'id': req.session.userid,
						'tacount': tacount,
						'mdListCategCount': JSON.stringify(mdListCategCount),
						'mdID': mdID,
						'batID': batID,
						'navMenuList': navMenuList,
						'modelList': modelList,
						'mgrMenuList': mgrMenuList,
						'tapopcount': tapopcount,
						'splcount': splcount,
						'api': java_api_endpoint,
						'modelInfo': modelInfo
					});

				}).catch(function (e) {
					console.log(e);

				});


			}
			else {
				res.render('index', { 'title': req.session.userid, 'items': "" });
			}

		});

	};
	return generaudicRoute;
}(Route_1.BaseRoute));
exports.generaudicRoute = generaudicRoute;
*/