"use strict";
const express = require('express');
const winston = require('winston');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const xlsx = require("node-xlsx");
const db = require("../utils/sql-server-connector").db;

const storage = path.resolve(__dirname, "../client/public/upload") + path.sep;
const upload = multer({ dest: storage });

module.exports = (app) => {
	console.log('[EvtadRoute::create] Creating Evtad route.');
	const router = express.Router();

	router.post('/EvtadUploadAct', upload.single('uploadingFile'), function (req, res) {
		if (req.session.userid && req.session.userid != '') {
			var evtpgID = req.body.evtpgID || '';
			var optradio = req.body.optradio || '';
			var filepath = '';
			var Fromindex, Toindex, Websiteindex, Channelindex, Positionindex, Sizeindex, Urlindex;
			var total;
			var successnum = 0;
			var errornum = 0;
			var updtime;
			var errormsg = '錯誤資訊<br/>';
			var allmsg = '';
			var funcCatge;
			var modelList = req.session.modelList;
			var navMenuList = req.session.navMenuList;
			var mgrMenuList = req.session.mgrMenuList;
			var p1 = new Promise(function (resolve, reject) {
				if (optradio == "cover") {
					db.query("DELETE FROM dm_EvtadMst where evtpgID =" + evtpgID, function (err, recordset) {
						if (err) {
							console.log(err);
							reject(2);
						}
						resolve(1);
					});
				}
				else
					resolve(1);
			});
			Promise.all([p1]).then(function (results) {
				var file = req.file;
				// 以下代碼得到檔案後綴
				var name = file.originalname;
				var nameArray = name.split('');
				var nameMime = [];
				var l = nameArray.pop();
				nameMime.unshift(l);
				while (nameArray.length != 0 && l != '.') {
					l = nameArray.pop();
					nameMime.unshift(l);
				} // Mime是檔案的後綴 Mime=nameMime.join('');
				// console.log(Mime); res.send("done"); //重命名檔案
				// 加上檔案後綴
				// fs.renameSync('./upload/'+file.filename,'./upload/'+file.filename+Mime);

				filepath = file.path;
				var list = xlsx.parse(filepath);
				total = list[0].data.length - 1;
				for (var i = 0; i < list[0].data[0].length; i++) {
					if (list[0].data[0][i] == "From") {
						Fromindex = i;

					}
					else if (list[0].data[0][i] == "To") {
						Toindex = i;

					}
					else if (list[0].data[0][i] == "Website") {
						Websiteindex = i;
					}
					else if (list[0].data[0][i] == "Channel") {
						Channelindex = i;
					}
					else if (list[0].data[0][i] == "Position") {
						Positionindex = i;
					}
					else if (list[0].data[0][i] == "Size") {
						Sizeindex = i;
					}
					else if (list[0].data[0][i] == "Url") {
						Urlindex = i;
					}
				}
				i = 1
				checkandinsert(i);
				function checkandinsert(i) {
					if (i < list[0].data.length) {
						if (list[0].data[i][Websiteindex] == undefined || list[0].data[i][Urlindex] == undefined) {
							errornum++;
							var linenum = i + 1;
							errormsg += 'Line ' + linenum.toString() + ','
							console.log(errormsg);
							for (var j = 0; j < list[0].data[i].length; j++) {
								if (j == list[0].data[i].length - 1)
									errormsg += list[0].data[i][j] + "\r\n";
								else
									errormsg += list[0].data[i][j] + ",";
							}
							if (i == list[0].data.length - 1) {
								var currentdate = new Date();
								var datetime = currentdate.getFullYear() + "/" + (currentdate.getMonth() + 1) + "/" + currentdate.getDate() + " "
									+ currentdate.getHours() + ":"
									+ currentdate.getMinutes() + ":"
									+ currentdate.getSeconds();
								res.render('Evtad_upload', { 
									'id': req.session.userid, 
									'modelList': modelList,
									'navMenuList': navMenuList,
									'mgrMenuList': mgrMenuList,
									"successnum": successnum, 
									'errormsg': errormsg, 
									'errornum': errornum, 
									'total': total, 
									'dispaly': 'block', 
									'datetime': datetime 
								});
							}
							checkandinsert(i + 1);
						}
						else {
							console.log("INSERT INTO dm_EvtadMst (evtpgID,url,adSource,adSdt,adEdt,adChannel,adPos,adSize,crtTime,updTime,updUser)VALUES(" + evtpgID + ",'" + list[0].data[i][Urlindex] + "','" + list[0].data[i][Websiteindex] + "','" + list[0].data[i][Fromindex] + "','" + list[0].data[i][Toindex] + "','" + list[0].data[i][Channelindex] + "','" + list[0].data[i][Positionindex] + "','" + list[0].data[i][Sizeindex] + "',GETDATE(),GETDATE(),'" + req.session.userid + "')");
							db.query("INSERT INTO dm_EvtadMst (evtpgID,url,adSource,adSdt,adEdt,adChannel,adPos,adSize,crtTime,updTime,updUser)VALUES(" + evtpgID + ",'" + list[0].data[i][Urlindex] + "','" + list[0].data[i][Websiteindex] + "','" + list[0].data[i][Fromindex] + "','" + list[0].data[i][Toindex] + "','" + list[0].data[i][Channelindex] + "','" + list[0].data[i][Positionindex] + "','" + list[0].data[i][Sizeindex] + "',GETDATE(),GETDATE(),'" + req.session.userid + "')", function (err, recordset) {
								if (err) {
									console.log(err);
								}
								successnum++;
								if (i == list[0].data.length - 1) {
									var currentdate = new Date();
									var datetime = currentdate.getFullYear() + "/" + (currentdate.getMonth() + 1) + "/" + currentdate.getDate() + " "
										+ currentdate.getHours() + ":"
										+ currentdate.getMinutes() + ":"
										+ currentdate.getSeconds();
									res.redirect("/Evtad/EvtadUpload?evtpgID=" + evtpgID + "&successnum=" + successnum + "&errormsg=" + errormsg + "&errornum=" + errornum + "&total=" + total + "&dispaly=block&datetime=" + datetime);
								}
								checkandinsert(i + 1);
							});
						}
					}
				}

			}).catch(function (e) {
				console.log(e);
			});

		}
		else {
			res.render('index', { 'title': req.session.userid, 'items': "" });
		}
	});

	router.post('/SearchEvtpgID', function (req, res) {
		var funcCatge = req.body.funcCatge;
		var client = req.body.client;
		var data = [];
		var p1 = new Promise(function (resolve, reject) {
			db.query("SELECT evtpgID,msm_tpc,convert(varchar, sdt, 111)sdt,convert(varchar, edt, 111)edt FROM dm_EvtpgMst where client = '" + client + "'  and funcCatge = '" + funcCatge + "' order by msm_tpc asc ", function (err, recordset) {
				if (err) {
					console.log(err);
					reject(2);
				}
				for (var i = 0; i < recordset.rowsAffected; i++) {
					data.push({
						value: recordset.recordset[i].evtpgID,
						msm_tpc: recordset.recordset[i].msm_tpc + "(" + recordset.recordset[i].sdt + "~" + recordset.recordset[i].edt + ")"
					});
				}
				resolve(1);
			});
		});
		Promise.all([p1]).then(function (results) {
			res.end(JSON.stringify(data));
		}).catch(function (e) {
			console.log(e);
		});
	});

	router.get('/EvtadUpload', function (req, res) {
		var successnum = req.query.successnum;
		var errormsg = req.query.errormsg || '';
		var errornum = req.query.errornum || '';
		var total = req.query.total || '';
		var dispaly = req.query.dispaly || '';
		var datetime = req.query.datetime || '';
		var evtpgID = req.query.evtpgID || '';
		var funcCatge;
		var adcount = 0;
		var updUser, updTime;
		var modelList = req.session.modelList;
		var navMenuList = req.session.navMenuList;
		var mgrMenuList = req.session.mgrMenuList;
		if (req.session.userid && req.session.userid != '') {
			var p1 = new Promise(function (resolve, reject) {
				db.query("SELECT codeValue,codeLabel FROM sy_CodeTable where codeGroup = 'funcCatge' order by codeValue desc ", function (err, recordset) {
					if (err) {
						console.log(err);
						reject(2);
					}
					funcCatge = recordset.recordset;
					resolve(1);
				});
			});
			var p2 = new Promise(function (resolve, reject) {
				if (evtpgID != '') {
					db.query("SELECT count(*)adcount FROM dm_EvtadMst where evtpgID = " + evtpgID, function (err, recordset) {
						if (err) {
							console.log(err);
							reject(2);
						}
						adcount = recordset.recordset[0].adcount;
						resolve(1);
					});
				}
				else
					resolve(1);
			});
			var p3 = new Promise(function (resolve, reject) {
				if (evtpgID != '') {
					db.query("SELECT TOP 1 convert(varchar, updTime, 120)updTime,updUser FROM dm_EvtadMst where evtpgID = " + evtpgID + " order by updTime desc ", function (err, recordset) {
						if (err) {
							console.log(err);
							reject(2);
						}
						updTime = recordset.recordset[0].updTime;
						updUser = recordset.recordset[0].updUser;
						resolve(1);
					});
				}
				else
					resolve(1);
			});
			Promise.all([p1, p2, p3]).then(function (results) {
				res.render('Evtad_upload', { 
					'id': req.session.userid, 
					'modelList': modelList,
					'navMenuList': navMenuList,
					'mgrMenuList': mgrMenuList,
					'funcCatge': funcCatge, 
					'successnum': successnum, 
					'errormsg': errormsg, 
					'errornum': errornum, 
					'total': total, 
					'dispaly': dispaly, 
					'datetime': datetime, 
					'updTime': updTime, 
					'updUser': updUser, 
					'adcount': adcount 
				});
			}).catch(function (e) {
				console.log(e);
			});

		}
		else {
			res.render('index', { 'title': req.session.userid });
		}
	});

	router.post('/addEvtadTag', function (req, res) {
		var evtadID = req.body.evtadID;
		var newtag = req.body.newtag;
		var issame = '';
		var tagID;
		newtag = newtag.trim();
		var p1 = new Promise(function (resolve, reject) {
			db.query("SELECT evtadID FROM dm_EvtadTag where evtadID=" + evtadID + " and tagLabel ='" + newtag + "' ", function (err, recordset) {
				if (err) {
					console.log(err);
					reject(2);
				}
				if (recordset.rowsAffected != 0)
					issame = 'Y';
				else
					issame = 'N';
				resolve(1);
			});
		});
		Promise.all([p1]).then(function (results) {
			if (issame == 'Y')
				res.end("已新增過");
			else {
				function addtag(evtadID, newtag, callback) {
					db.query("INSERT INTO dm_EvtadTag(evtadID,tagLabel,updTime,updUser) VALUES(" + evtadID + ",'" + newtag + "',GETDATE(),'" + req.session.userid + "') ", function (err, recordset) {
						if (err)
							callback(err, null);
						else
							callback(null, 0);
					});
				}
				addtag(evtadID, newtag, function (err, data) {
					if (err)
						console.log("ERROR : ", err);
					else {
						db.query("SELECT TOP 1 tagID FROM dm_EvtadTag where evtadID =" + evtadID + " order by tagID desc  ", function (err, recordset) {
							if (err)
								console.log(err);
							tagID = recordset.recordset[0].tagID;
							res.end(tagID.toString());
						});
					}
				});
			}
		}).catch(function (e) {
			console.log(e);
		});


	});

	router.post('/delEvtadTag', function (req, res) {
		var evtadID = req.body.evtadID;
		var tagID = req.body.tagID;
		db.query("DELETE FROM dm_EvtadTag where evtadID =" + evtadID + " and tagID = " + tagID, function (err, recordset) {
			if (err) console.log(err);
			res.end('ok');
		});
	});

	router.post('/udEvtad', function (req, res) {
		var evtadID = req.body.evtadID;
		var adSdt = req.body.adSdt;
		var adEdt = req.body.adEdt;
		var adPos = req.body.adPos;
		var adSize = req.body.adSize;
		var url = req.body.url;
		db.query("update dm_EvtadMst set adSdt ='" + adSdt + "',adEdt ='" + adEdt + "',adPos ='" + adPos + "',adSize ='" + adSize + "',url ='" + url + "'  where evtadID =" + evtadID, function (err, recordset) {
			if (err) console.log(err);
			res.end('ok');
		});
	});

	router.post('/delEvtad', function (req, res) {
		var evtadID = req.body.evtadID;
		var adSdt = req.body.adSdt;
		var adEdt = req.body.adEdt;
		var adPos = req.body.adPos;
		var adSize = req.body.adSize;
		var url = req.body.url;
		db.query("delete from dm_EvtadMst where evtadID =" + evtadID, function (err, recordset) {
			if (err) console.log(err);
			res.end('ok');
		});
	});

	router.get('/EvtadList', function (req, res) {
		var modelList = req.session.modelList;
		var navMenuList = req.session.navMenuList;
		var mgrMenuList = req.session.mgrMenuList;
		var evtpgID = req.query.evtpgID || '';
		var msm_tpc = req.query.msm_tpc || '';
		var data = [];
		var taginfo = [];
		var adlist = [];
		var ad = [];
		if (req.session.userid && req.session.userid != '') {
			var p1 = new Promise(function (resolve, reject) {
				db.query("SELECT ROW_NUMBER() OVER (ORDER BY a.adSdt ASC) as no,a.evtadID,a.evtpgID,a.url,a.adChannel,a.adSource,a.adPos,a.adSize,a.updUser,convert(varchar, a.adSdt, 111)adSdt,convert(varchar, a.adEdt, 111)adEdt,convert(varchar, a.updTime, 120)updTime, (select count(*) from dm_EvtadTag b where a.evtadID = b.evtadID) sumtag FROM dm_EvtadMst a where a.evtpgID =" + evtpgID + " order by a.adSdt asc ", function (err, recordset) {
					if (err) {
						console.log(err);
						reject(2);
					}
					for (var i = 0; i < recordset.rowsAffected; i++) {
						ad = [];
						ad.push({
							no: recordset.recordset[i].no,
							evtadID: recordset.recordset[i].evtadID,
							evtpgID: recordset.recordset[i].evtpgID,
							adSource: recordset.recordset[i].adSource,
							adChannel: recordset.recordset[i].adChannel,
							adPos: recordset.recordset[i].adPos,
							adSize: recordset.recordset[i].adSize,
							sumtag: recordset.recordset[i].sumtag,
							updTime: recordset.recordset[i].updTime,
							updUser: recordset.recordset[i].updUser,
							adSdt: recordset.recordset[i].adSdt,
							adEdt: recordset.recordset[i].adEdt,
							url: recordset.recordset[i].url


						});
						adlist.push({
							ad: ad
						});
					}

					resolve(1);
				});
			});
			Promise.all([p1]).then(function (results) {
				db.query("SELECT deat.*  FROM dm_EvtadTag deat where deat.evtadID in ( select dem.evtadID from dm_EvtadMst dem where dem.evtpgID = " + evtpgID + " )", function (err, recordset) {
					if (err)
						console.log(err);
					for (var i = 0; i < adlist.length; i++) {
						taginfo = [];
						for (var j = 0; j < recordset.rowsAffected; j++) {
							if (adlist[i].ad[0].evtadID == recordset.recordset[j].evtadID) {
								taginfo.push({
									tag: recordset.recordset[j].tagLabel,
									tagID: recordset.recordset[j].tagID
								});
							}

						}
						adlist[i].ad.push({
							taginfo: taginfo
						});
					}
					console.log(JSON.stringify(adlist));
					res.render('EvadList', { 
						'id': req.session.userid, 
						'items': recordset.recordset, 
						'modelList': modelList,
						'navMenuList': navMenuList,
						'mgrMenuList': mgrMenuList,
						'adlist': JSON.stringify(adlist), 
						//'msm_tpc': msm_tpc, 
						'evtpgID': evtpgID 
					});
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
var fs = require('fs');
const path = require('path');
var storage = path.resolve(__dirname, "../client/public/upload") + path.sep;
var multer = require('multer')
var upload = multer({ dest: storage });
var xlsx = require("node-xlsx");
var EvadRoute = (function (_super) {
	__extends(EvadRoute, _super);
	function EvadRoute() {
		return _super.call(this) || this;
	}
	EvadRoute.create = function (router) {
		console.log('[EvtadRoute::create] Creating Evtad route.');
		router.post('/EvtadUploadAct', upload.single('uploadingFile'), function (req, res) {
			if (req.session.userid && req.session.userid != '') {
				var evtpgID = req.body.evtpgID || '';
				var optradio = req.body.optradio || '';
				var filepath = '';
				var Fromindex, Toindex, Websiteindex, Channelindex, Positionindex, Sizeindex, Urlindex;
				var total;
				var successnum = 0;
				var errornum = 0;
				var updtime;
				var errormsg = '錯誤資訊<br/>';
				var allmsg = '';
				var funcCatge;
				var modelList = req.session.modelList;
				var navMenuList = req.session.navMenuList;
				var mgrMenuList = req.session.mgrMenuList;
				var p1 = new Promise(function (resolve, reject) {
					if (optradio == "cover") {
						db.query("DELETE FROM dm_EvtadMst where evtpgID =" + evtpgID, function (err, recordset) {
							if (err) {
								console.log(err);
								reject(2);
							}
							resolve(1);
						});
					}
					else
						resolve(1);
				});
				Promise.all([p1]).then(function (results) {
					var file = req.file;
					// 以下代碼得到檔案後綴
					var name = file.originalname;
					var nameArray = name.split('');
					var nameMime = [];
					var l = nameArray.pop();
					nameMime.unshift(l);
					while (nameArray.length != 0 && l != '.') {
						l = nameArray.pop();
						nameMime.unshift(l);
					} // Mime是檔案的後綴 Mime=nameMime.join('');
					// console.log(Mime); res.send("done"); //重命名檔案
					// 加上檔案後綴
					// fs.renameSync('./upload/'+file.filename,'./upload/'+file.filename+Mime);

					filepath = file.path;
					var list = xlsx.parse(filepath);
					total = list[0].data.length - 1;
					for (var i = 0; i < list[0].data[0].length; i++) {
						if (list[0].data[0][i] == "From") {
							Fromindex = i;

						}
						else if (list[0].data[0][i] == "To") {
							Toindex = i;

						}
						else if (list[0].data[0][i] == "Website") {
							Websiteindex = i;
						}
						else if (list[0].data[0][i] == "Channel") {
							Channelindex = i;
						}
						else if (list[0].data[0][i] == "Position") {
							Positionindex = i;
						}
						else if (list[0].data[0][i] == "Size") {
							Sizeindex = i;
						}
						else if (list[0].data[0][i] == "Url") {
							Urlindex = i;
						}
					}
					i = 1
					checkandinsert(i);
					function checkandinsert(i) {
						if (i < list[0].data.length) {
							if (list[0].data[i][Websiteindex] == undefined || list[0].data[i][Urlindex] == undefined) {
								errornum++;
								var linenum = i + 1;
								errormsg += 'Line ' + linenum.toString() + ','
								console.log(errormsg);
								for (var j = 0; j < list[0].data[i].length; j++) {
									if (j == list[0].data[i].length - 1)
										errormsg += list[0].data[i][j] + "\r\n";
									else
										errormsg += list[0].data[i][j] + ",";
								}
								if (i == list[0].data.length - 1) {
									var currentdate = new Date();
									var datetime = currentdate.getFullYear() + "/" + (currentdate.getMonth() + 1) + "/" + currentdate.getDate() + " "
										+ currentdate.getHours() + ":"
										+ currentdate.getMinutes() + ":"
										+ currentdate.getSeconds();
									res.render('Evtad_upload', { 
										'id': req.session.userid, 
										'modelList': modelList,
										'navMenuList': navMenuList,
										'mgrMenuList': mgrMenuList,
										"successnum": successnum, 
										'errormsg': errormsg, 
										'errornum': errornum, 
										'total': total, 
										'dispaly': 'block', 
										'datetime': datetime 
									});
								}
								checkandinsert(i + 1);
							}
							else {
								console.log("INSERT INTO dm_EvtadMst (evtpgID,url,adSource,adSdt,adEdt,adChannel,adPos,adSize,crtTime,updTime,updUser)VALUES(" + evtpgID + ",'" + list[0].data[i][Urlindex] + "','" + list[0].data[i][Websiteindex] + "','" + list[0].data[i][Fromindex] + "','" + list[0].data[i][Toindex] + "','" + list[0].data[i][Channelindex] + "','" + list[0].data[i][Positionindex] + "','" + list[0].data[i][Sizeindex] + "',GETDATE(),GETDATE(),'" + req.session.userid + "')");
								db.query("INSERT INTO dm_EvtadMst (evtpgID,url,adSource,adSdt,adEdt,adChannel,adPos,adSize,crtTime,updTime,updUser)VALUES(" + evtpgID + ",'" + list[0].data[i][Urlindex] + "','" + list[0].data[i][Websiteindex] + "','" + list[0].data[i][Fromindex] + "','" + list[0].data[i][Toindex] + "','" + list[0].data[i][Channelindex] + "','" + list[0].data[i][Positionindex] + "','" + list[0].data[i][Sizeindex] + "',GETDATE(),GETDATE(),'" + req.session.userid + "')", function (err, recordset) {
									if (err) {
										console.log(err);
									}
									successnum++;
									if (i == list[0].data.length - 1) {
										var currentdate = new Date();
										var datetime = currentdate.getFullYear() + "/" + (currentdate.getMonth() + 1) + "/" + currentdate.getDate() + " "
											+ currentdate.getHours() + ":"
											+ currentdate.getMinutes() + ":"
											+ currentdate.getSeconds();
										res.redirect("/Evtad/EvtadUpload?evtpgID=" + evtpgID + "&successnum=" + successnum + "&errormsg=" + errormsg + "&errornum=" + errornum + "&total=" + total + "&dispaly=block&datetime=" + datetime);
									}
									checkandinsert(i + 1);
								});
							}
						}
					}

				}).catch(function (e) {
					console.log(e);
				});

			}
			else {
				res.render('index', { 'title': req.session.userid, 'items': "" });
			}
		});
		router.post('/SearchEvtpgID', function (req, res) {
			var funcCatge = req.body.funcCatge;
			var client = req.body.client;
			var data = [];
			var p1 = new Promise(function (resolve, reject) {
				db.query("SELECT evtpgID,msm_tpc,convert(varchar, sdt, 111)sdt,convert(varchar, edt, 111)edt FROM dm_EvtpgMst where client = '" + client + "'  and funcCatge = '" + funcCatge + "' order by msm_tpc asc ", function (err, recordset) {
					if (err) {
						console.log(err);
						reject(2);
					}
					for (var i = 0; i < recordset.rowsAffected; i++) {
						data.push({
							value: recordset.recordset[i].evtpgID,
							msm_tpc: recordset.recordset[i].msm_tpc + "(" + recordset.recordset[i].sdt + "~" + recordset.recordset[i].edt + ")"
						});
					}
					resolve(1);
				});
			});
			Promise.all([p1]).then(function (results) {
				res.end(JSON.stringify(data));
			}).catch(function (e) {
				console.log(e);
			});
		});
		router.get('/EvtadUpload', function (req, res) {
			var successnum = req.query.successnum;
			var errormsg = req.query.errormsg || '';
			var errornum = req.query.errornum || '';
			var total = req.query.total || '';
			var dispaly = req.query.dispaly || '';
			var datetime = req.query.datetime || '';
			var evtpgID = req.query.evtpgID || '';
			var funcCatge;
			var adcount = 0;
			var updUser, updTime;
			var modelList = req.session.modelList;
			var navMenuList = req.session.navMenuList;
			var mgrMenuList = req.session.mgrMenuList;
			if (req.session.userid && req.session.userid != '') {
				var p1 = new Promise(function (resolve, reject) {
					db.query("SELECT codeValue,codeLabel FROM sy_CodeTable where codeGroup = 'funcCatge' order by codeValue desc ", function (err, recordset) {
						if (err) {
							console.log(err);
							reject(2);
						}
						funcCatge = recordset.recordset;
						resolve(1);
					});
				});
				var p2 = new Promise(function (resolve, reject) {
					if (evtpgID != '') {
						db.query("SELECT count(*)adcount FROM dm_EvtadMst where evtpgID = " + evtpgID, function (err, recordset) {
							if (err) {
								console.log(err);
								reject(2);
							}
							adcount = recordset.recordset[0].adcount;
							resolve(1);
						});
					}
					else
						resolve(1);
				});
				var p3 = new Promise(function (resolve, reject) {
					if (evtpgID != '') {
						db.query("SELECT TOP 1 convert(varchar, updTime, 120)updTime,updUser FROM dm_EvtadMst where evtpgID = " + evtpgID + " order by updTime desc ", function (err, recordset) {
							if (err) {
								console.log(err);
								reject(2);
							}
							updTime = recordset.recordset[0].updTime;
							updUser = recordset.recordset[0].updUser;
							resolve(1);
						});
					}
					else
						resolve(1);
				});
				Promise.all([p1, p2, p3]).then(function (results) {
					res.render('Evtad_upload', { 
						'id': req.session.userid, 
						'modelList': modelList,
						'navMenuList': navMenuList,
						'mgrMenuList': mgrMenuList,
						'funcCatge': funcCatge, 
						'successnum': successnum, 
						'errormsg': errormsg, 
						'errornum': errornum, 
						'total': total, 
						'dispaly': dispaly, 
						'datetime': datetime, 
						'updTime': updTime, 
						'updUser': updUser, 
						'adcount': adcount 
					});
				}).catch(function (e) {
					console.log(e);
				});

			}
			else {
				res.render('index', { 'title': req.session.userid });
			}
		});
		router.post('/addEvtadTag', function (req, res) {
			var evtadID = req.body.evtadID;
			var newtag = req.body.newtag;
			var issame = '';
			var tagID;
			newtag = newtag.trim();
			var p1 = new Promise(function (resolve, reject) {
				db.query("SELECT evtadID FROM dm_EvtadTag where evtadID=" + evtadID + " and tagLabel ='" + newtag + "' ", function (err, recordset) {
					if (err) {
						console.log(err);
						reject(2);
					}
					if (recordset.rowsAffected != 0)
						issame = 'Y';
					else
						issame = 'N';
					resolve(1);
				});
			});
			Promise.all([p1]).then(function (results) {
				if (issame == 'Y')
					res.end("已新增過");
				else {
					function addtag(evtadID, newtag, callback) {
						db.query("INSERT INTO dm_EvtadTag(evtadID,tagLabel,updTime,updUser) VALUES(" + evtadID + ",'" + newtag + "',GETDATE(),'" + req.session.userid + "') ", function (err, recordset) {
							if (err)
								callback(err, null);
							else
								callback(null, 0);
						});
					}
					addtag(evtadID, newtag, function (err, data) {
						if (err)
							console.log("ERROR : ", err);
						else {
							db.query("SELECT TOP 1 tagID FROM dm_EvtadTag where evtadID =" + evtadID + " order by tagID desc  ", function (err, recordset) {
								if (err)
									console.log(err);
								tagID = recordset.recordset[0].tagID;
								res.end(tagID.toString());
							});
						}
					});
				}
			}).catch(function (e) {
				console.log(e);
			});


		});
		router.post('/delEvtadTag', function (req, res) {
			var evtadID = req.body.evtadID;
			var tagID = req.body.tagID;
			db.query("DELETE FROM dm_EvtadTag where evtadID =" + evtadID + " and tagID = " + tagID, function (err, recordset) {
				if (err) console.log(err);
				res.end('ok');
			});
		});
		router.post('/udEvtad', function (req, res) {
			var evtadID = req.body.evtadID;
			var adSdt = req.body.adSdt;
			var adEdt = req.body.adEdt;
			var adPos = req.body.adPos;
			var adSize = req.body.adSize;
			var url = req.body.url;
			db.query("update dm_EvtadMst set adSdt ='" + adSdt + "',adEdt ='" + adEdt + "',adPos ='" + adPos + "',adSize ='" + adSize + "',url ='" + url + "'  where evtadID =" + evtadID, function (err, recordset) {
				if (err) console.log(err);
				res.end('ok');
			});
		});
		router.post('/delEvtad', function (req, res) {
			var evtadID = req.body.evtadID;
			var adSdt = req.body.adSdt;
			var adEdt = req.body.adEdt;
			var adPos = req.body.adPos;
			var adSize = req.body.adSize;
			var url = req.body.url;
			db.query("delete from dm_EvtadMst where evtadID =" + evtadID, function (err, recordset) {
				if (err) console.log(err);
				res.end('ok');
			});
		});
		router.get('/EvtadList', function (req, res) {
			var modelList = req.session.modelList;
			var navMenuList = req.session.navMenuList;
			var mgrMenuList = req.session.mgrMenuList;
			var evtpgID = req.query.evtpgID || '';
			var msm_tpc = req.query.msm_tpc || '';
			var data = [];
			var taginfo = [];
			var adlist = [];
			var ad = [];
			if (req.session.userid && req.session.userid != '') {
				var p1 = new Promise(function (resolve, reject) {
					db.query("SELECT ROW_NUMBER() OVER (ORDER BY a.adSdt ASC) as no,a.evtadID,a.evtpgID,a.url,a.adChannel,a.adSource,a.adPos,a.adSize,a.updUser,convert(varchar, a.adSdt, 111)adSdt,convert(varchar, a.adEdt, 111)adEdt,convert(varchar, a.updTime, 120)updTime, (select count(*) from dm_EvtadTag b where a.evtadID = b.evtadID) sumtag FROM dm_EvtadMst a where a.evtpgID =" + evtpgID + " order by a.adSdt asc ", function (err, recordset) {
						if (err) {
							console.log(err);
							reject(2);
						}
						for (var i = 0; i < recordset.rowsAffected; i++) {
							ad = [];
							ad.push({
								no: recordset.recordset[i].no,
								evtadID: recordset.recordset[i].evtadID,
								evtpgID: recordset.recordset[i].evtpgID,
								adSource: recordset.recordset[i].adSource,
								adChannel: recordset.recordset[i].adChannel,
								adPos: recordset.recordset[i].adPos,
								adSize: recordset.recordset[i].adSize,
								sumtag: recordset.recordset[i].sumtag,
								updTime: recordset.recordset[i].updTime,
								updUser: recordset.recordset[i].updUser,
								adSdt: recordset.recordset[i].adSdt,
								adEdt: recordset.recordset[i].adEdt,
								url: recordset.recordset[i].url


							});
							adlist.push({
								ad: ad
							});
						}

						resolve(1);
					});
				});
				Promise.all([p1]).then(function (results) {
					db.query("SELECT deat.*  FROM dm_EvtadTag deat where deat.evtadID in ( select dem.evtadID from dm_EvtadMst dem where dem.evtpgID = " + evtpgID + " )", function (err, recordset) {
						if (err)
							console.log(err);
						for (var i = 0; i < adlist.length; i++) {
							taginfo = [];
							for (var j = 0; j < recordset.rowsAffected; j++) {
								if (adlist[i].ad[0].evtadID == recordset.recordset[j].evtadID) {
									taginfo.push({
										tag: recordset.recordset[j].tagLabel,
										tagID: recordset.recordset[j].tagID
									});
								}

							}
							adlist[i].ad.push({
								taginfo: taginfo
							});
						}
						console.log(JSON.stringify(adlist));
						res.render('EvadList', { 
							'id': req.session.userid, 
							'items': recordset.recordset, 
							'modelList': modelList,
							'navMenuList': navMenuList,
							'mgrMenuList': mgrMenuList,
							'adlist': JSON.stringify(adlist), 
							//'msm_tpc': msm_tpc, 
							'evtpgID': evtpgID 
						});
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
	return EvadRoute;
}(Route_1.BaseRoute));
exports.EvadRoute = EvadRoute;


*/