"use strict";
const express = require('express');
const db = require("../utils/sql-server-connector").db;
const fs = require('fs');
const path = require('path');
const storage = path.resolve(__dirname, "../client/public/upload") + path.sep;
const multer = require('multer')
const upload = multer({ dest: storage });
const xlsx = require("node-xlsx");

module.exports = (app) => {
	console.log('[talist_putuploadRoute::create] Creating talist_putupload route.');
	let router = express.Router();

	router.post('/talist_putuploadAddact', upload.single('uploadingFile'), function (req, res) {
		if (req.session.userid && req.session.userid != '') {
			var mdID = req.body.mdID || '';
			var batID = req.body.batID || '';
			var sentListCateg = req.body.sentListCateg || '';
			var sentListChannel = req.body.sentListChannel || '';
			var startDate = req.body.startDate || '';
			var sentListName = req.body.sentListName || '';
			var sentListDesc = req.body.sentListDesc || '';
			var optradio = req.body.optradio || '';
			var filepath = '';
			var VINindex, CustIDindex, LISCNOindex;
			var key = '';
			var newindex;
			var total;
			var successnum = 0;
			var errornum = 0;
			var updtime;
			var errormsg = '錯誤資訊<br/>';
			var allmsg = '';
			if (optradio == 'car')
				key = 'LISCNO';
			else if (optradio == 'uID')
				key = 'CustID';
			else
				key = 'VIN';
			var keyindex = 0;
			var modelList = req.session.modelList;
			var navMenuList = req.session.navMenuList;
			var mgrMenuList = req.session.mgrMenuList;
			var p1 = new Promise(function (resolve, reject) {
				function getnewindex(mdID, callback) {
					db.query("INSERT INTO cu_SentListMst(mdID,batID,sentListName,sentListCateg,sentListChannel,sentListDesc,sentListTime,updTime,updUser) values('" + mdID + "','" + batID + "','" + sentListName + "','" + sentListCateg + "','" + sentListChannel + "','" + sentListDesc + "','" + startDate + "',GETDATE(),'" + req.session.userid + "')", function (err, recordset) {
						if (err) {
							console.log(err);
							reject(2);
						}
						callback(null, 0);
					});
				}
				getnewindex(mdID, function (err, data) {
					db.query("SELECT TOP 1 sentListID FROM cu_SentListMst where mdID ='" + mdID + "' and batID ='" + batID + "' order by sentListID desc ", function (err, recordset) {
						newindex = recordset.recordset[0].sentListID;
						resolve(1);
					});
				});
			});
			var p2 = new Promise(function (resolve, reject) {
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
				resolve(1);
			});
			Promise.all([p1, p2]).then(function (results) {
				var list = xlsx.parse(filepath);
				total = list[0].data.length - 1;
				for (var i = 0; i < list[0].data[0].length; i++) {
					if (list[0].data[0][i] == "LISCNO") {
						LISCNOindex = i;
						if (key == 'LISCNO')
							keyindex = i;
					}
					else if (list[0].data[0][i] == "CustID") {
						CustIDindex = i;
						if (key == 'CustID')
							keyindex = i;
					}
					else if (list[0].data[0][i] == "VIN") {
						VINindex = i;
						if (key == 'VIN')
							keyindex = i;
					}
				}
				i = 1
				checkandinsert(i);
				function checkandinsert(i) {
					if (i < list[0].data.length) {
						if (list[0].data[i][keyindex] == "") {
							errornum++;
							var linenum = i + 1;
							errormsg += 'Line ' + linenum.toString() + ','
							for (var j = 0; j < list[0].data[i].length; j++) {
								if (j == list[0].data[i].length - 1)
									errormsg += list[0].data[i][j] + "<br/>";
								else
									errormsg += list[0].data[i][j] + ",";
							}
							if (i == list[0].data.length - 1) {
								var datetime = currentdate.getFullYear() + "/" + (currentdate.getMonth() + 1) + "/" + currentdate.getDate() + " "
									+ currentdate.getHours() + ":"
									+ currentdate.getMinutes() + ":"
									+ currentdate.getSeconds();
								res.render('talist_putupload_add', {
									'id': req.session.userid,
									'modelList': modelList,
									'navMenuList': navMenuList,
									'mgrMenuList': mgrMenuList,
									"successnum": successnum,
									'errormsg': errormsg,
									'errornum': errornum,
									'mdID': mdID,
									'total': total,
									'dispaly': 'block',
									'datetime': datetime
								});
							}

							checkandinsert(i + 1);

						}
						else {
							function checkdata(mdID, callback) {
								if (key == 'LISCNO') {
									db.query("SELECT CustID_u FROM cu_LiscnoIndex where LISCNO  = '" + list[0].data[i][keyindex] + "'", function (err, recordset) {
										if (err)
											console.log(err);
										if (recordset.rowsAffected == 0)
											callback(null, "0");
										else
											callback(null, recordset.recordset[0].CustID_u);
									});
								}
								else if (key == 'VIN') {
									db.query("SELECT CustID_u FROM cu_LiscnoIndex where VIN  = '" + list[0].data[i][keyindex] + "'", function (err, recordset) {
										if (err)
											console.log(err);
										if (recordset.rowsAffected == 0)
											callback(null, "0");
										else
											callback(null, recordset.recordset[0].CustID_u);
									});
								}
								else if (key == 'CustID') {
									callback(null, list[0].data[i][keyindex]);
								}
							}
							checkdata(mdID, function (err, data1) {
								if (err)
									console.log("ERROR : ", err);
								if (data1 == "0") {
									errornum++;
									var linenum = i + 1;
									errormsg += 'Line ' + linenum.toString() + ','
									console.log(errormsg);
									for (var j = 0; j < list[0].data[i].length; j++) {
										if (j == list[0].data[i].length - 1)
											errormsg += list[0].data[i][j] + "<br/>";
										else
											errormsg += list[0].data[i][j] + ",";
									}
									if (i == list[0].data.length - 1) {
										var currentdate = new Date();
										var datetime = currentdate.getFullYear() + "/" + (currentdate.getMonth() + 1) + "/" + currentdate.getDate() + " "
											+ currentdate.getHours() + ":"
											+ currentdate.getMinutes() + ":"
											+ currentdate.getSeconds();
										res.render('talist_putupload_add', {
											'id': req.session.userid,
											'modelList': modelList,
											'navMenuList': navMenuList,
											'mgrMenuList': mgrMenuList,
											'successnum': successnum,
											'errormsg': errormsg,
											'errornum': errornum,
											'mdID': mdID,
											'total': total,
											'dispaly':
												'block',
											'datetime': datetime
										});
									}

									checkandinsert(i + 1);
								}
								else {
									console.log("INSERT INTO cu_SentListDet (mdID,batID,sentListID,uCustID,uLicsNO,uVIN,rptKey) values('" + mdID + "','" + batID + "'," + newindex + ",'" + list[0].data[i][CustIDindex] + "','" + list[0].data[i][LISCNOindex] + "','" + list[0].data[i][VINindex] + "','" + data1 + "')");
									db.query("INSERT INTO cu_SentListDet (mdID,batID,sentListID,uCustID,uLicsNO,uVIN,rptKey) values('" + mdID + "','" + batID + "'," + newindex + ",'" + list[0].data[i][CustIDindex] + "','" + list[0].data[i][LISCNOindex] + "','" + list[0].data[i][VINindex] + "','" + data1 + "')", function (err, recordset) {
										if (err) {
											console.log(err);
										}
										successnum++;
										if (i == list[0].data.length - 1) {
											var datetime = currentdate.getFullYear() + "/" + (currentdate.getMonth() + 1) + "/" + currentdate.getDate() + " "
												+ currentdate.getHours() + ":"
												+ currentdate.getMinutes() + ":"
												+ currentdate.getSeconds();
											res.render('talist_putupload_add', {
												'id': req.session.userid,
												'modelList': modelList,
												'navMenuList': navMenuList,
												'mgrMenuList': mgrMenuList,
												'successnum': successnum,
												'errormsg': errormsg,
												'errornum': errornum,
												'mdID': mdID,
												'total': total,
												'dispaly': 'block',
												'datetime': datetime
											});
										}

										checkandinsert(i + 1);
									});
								}
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

	router.get('/talist_putuploadAdd', function (req, res) {
		if (req.session.userid && req.session.userid != '') {
			var mdID = req.query.mdID || '';
			var batID = req.query.batID || '';
			var batchlist;
			var sentListCateg;
			var sentListChannel;
			var items;
			var p1 = new Promise(function (resolve, reject) {
				db.query("SELECT batID,batName FROM md_Batch where mdID ='" + mdID + "' and isClosed <> 'Y'  and isDel <> 'Y' order by updTime desc ", function (err, recordset) {
					if (err) {
						console.log(err);
						reject(2);
					}
					batchlist = recordset.recordset;
					resolve(1);
				});
			});
			var p2 = new Promise(function (resolve, reject) {
				db.query("SELECT codeValue,codeLabel FROM sy_CodeTable where codeGroup = 'sentListCateg'", function (err, recordset) {
					if (err) {
						console.log(err);
						reject(2);
					}
					sentListCateg = recordset.recordset;
					resolve(2);
				});
			});
			var p3 = new Promise(function (resolve, reject) {
				db.query("SELECT codeValue,codeLabel FROM sy_CodeTable where codeGroup = 'sentListChannel'", function (err, recordset) {
					if (err) {
						console.log(err);
						reject(2);
					}
					sentListChannel = recordset.recordset;
					resolve(3);
				});
			});
			Promise.all([p1, p2, p3]).then(function (results) {
				db.query("SELECT mdName FROM md_Model where mdID = '" + mdID + "'", function (err, recordset) {
					if (err) {
						console.log(err);
					}
					var modelList = req.session.modelList;
					var navMenuList = req.session.navMenuList;
					var mgrMenuList = req.session.mgrMenuList;
					items = recordset.recordset;
					res.render('talist_putupload_add', {
						'id': req.session.userid,
						'modelInfo': items[0],
						'funcName': '投放名單上傳',
						'modelList': modelList,
						'navMenuList': navMenuList,
						'mgrMenuList': mgrMenuList,
						'batchlist': batchlist,
						'sentListCateg': sentListCateg,
						'sentListChannel': sentListChannel,
						'mdID': mdID
					});
				});
			}).catch(function (e) {
				console.log(e);
			});
		}
		else {
			res.render('index', { 'title': req.session.userid });
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
const storage = path.resolve(__dirname, "./client/public/upload") + path.sep;
var multer = require('multer')
var upload = multer({ dest: storage });
var xlsx = require("node-xlsx");
var talist_putuploadRoute = (function (_super) {
	__extends(talist_putuploadRoute, _super);
	function talist_putuploadRoute() {
		return _super.call(this) || this;
	}
	talist_putuploadRoute.create = function (router) {
		console.log('[talist_putuploadRoute::create] Creating talist_putupload route.');
		router.post('/talist_putuploadAddact', upload.single('uploadingFile'), function (req, res) {
			if (req.session.userid && req.session.userid != '') {
				var mdID = req.body.mdID || '';
				var batID = req.body.batID || '';
				var sentListCateg = req.body.sentListCateg || '';
				var sentListChannel = req.body.sentListChannel || '';
				var startDate = req.body.startDate || '';
				var sentListName = req.body.sentListName || '';
				var sentListDesc = req.body.sentListDesc || '';
				var optradio = req.body.optradio || '';
				var filepath = '';
				var VINindex, CustIDindex, LISCNOindex;
				var key = '';
				var newindex;
				var total;
				var successnum = 0;
				var errornum = 0;
				var updtime;
				var errormsg = '錯誤資訊<br/>';
				var allmsg = '';
				if (optradio == 'car')
					key = 'LISCNO';
				else if (optradio == 'uID')
					key = 'CustID';
				else
					key = 'VIN';
				var keyindex = 0;
				var modelList = req.session.modelList;
				var navMenuList = req.session.navMenuList;
				var mgrMenuList = req.session.mgrMenuList;
				var p1 = new Promise(function (resolve, reject) {
					function getnewindex(mdID, callback) {
						db.query("INSERT INTO cu_SentListMst(mdID,batID,sentListName,sentListCateg,sentListChannel,sentListDesc,sentListTime,updTime,updUser) values('" + mdID + "','" + batID + "','" + sentListName + "','" + sentListCateg + "','" + sentListChannel + "','" + sentListDesc + "','" + startDate + "',GETDATE(),'" + req.session.userid + "')", function (err, recordset) {
							if (err) {
								console.log(err);
								reject(2);
							}
							callback(null, 0);


						});

					}
					getnewindex(mdID, function (err, data) {
						db.query("SELECT TOP 1 sentListID FROM cu_SentListMst where mdID ='" + mdID + "' and batID ='" + batID + "' order by sentListID desc ", function (err, recordset) {
							newindex = recordset.recordset[0].sentListID;
							resolve(1);
						});
					});
				});
				var p2 = new Promise(function (resolve, reject) {
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
					resolve(1);
				});
				Promise.all([p1, p2]).then(function (results) {
					var list = xlsx.parse(filepath);
					total = list[0].data.length - 1;
					for (var i = 0; i < list[0].data[0].length; i++) {
						if (list[0].data[0][i] == "LISCNO") {
							LISCNOindex = i;
							if (key == 'LISCNO')
								keyindex = i;
						}
						else if (list[0].data[0][i] == "CustID") {
							CustIDindex = i;
							if (key == 'CustID')
								keyindex = i;
						}
						else if (list[0].data[0][i] == "VIN") {
							VINindex = i;
							if (key == 'VIN')
								keyindex = i;
						}
					}
					i = 1
					checkandinsert(i);
					function checkandinsert(i) {
						if (i < list[0].data.length) {
							if (list[0].data[i][keyindex] == "") {
								errornum++;
								var linenum = i + 1;
								errormsg += 'Line ' + linenum.toString() + ','
								for (var j = 0; j < list[0].data[i].length; j++) {
									if (j == list[0].data[i].length - 1)
										errormsg += list[0].data[i][j] + "<br/>";
									else
										errormsg += list[0].data[i][j] + ",";
								}
								if (i == list[0].data.length - 1) {
									var datetime = currentdate.getFullYear() + "/" + (currentdate.getMonth() + 1) + "/" + currentdate.getDate() + " "
										+ currentdate.getHours() + ":"
										+ currentdate.getMinutes() + ":"
										+ currentdate.getSeconds();
									res.render('talist_putupload_add', {
										'id': req.session.userid,
										'modelList': modelList,
										'navMenuList': navMenuList,
										'mgrMenuList': mgrMenuList,
										"successnum": successnum,
										'errormsg': errormsg,
										'errornum': errornum,
										'mdID': mdID,
										'total': total,
										'dispaly': 'block',
										'datetime': datetime
									});
								}

								checkandinsert(i + 1);

							}
							else {
								function checkdata(mdID, callback) {
									if (key == 'LISCNO') {
										db.query("SELECT CustID_u FROM cu_LiscnoIndex where LISCNO  = '" + list[0].data[i][keyindex] + "'", function (err, recordset) {
											if (err)
												console.log(err);
											if (recordset.rowsAffected == 0)
												callback(null, "0");
											else
												callback(null, recordset.recordset[0].CustID_u);
										});
									}
									else if (key == 'VIN') {
										db.query("SELECT CustID_u FROM cu_LiscnoIndex where VIN  = '" + list[0].data[i][keyindex] + "'", function (err, recordset) {
											if (err)
												console.log(err);
											if (recordset.rowsAffected == 0)
												callback(null, "0");
											else
												callback(null, recordset.recordset[0].CustID_u);
										});
									}
									else if (key == 'CustID') {
										callback(null, list[0].data[i][keyindex]);
									}
								}
								checkdata(mdID, function (err, data1) {
									if (err)
										console.log("ERROR : ", err);
									if (data1 == "0") {
										errornum++;
										var linenum = i + 1;
										errormsg += 'Line ' + linenum.toString() + ','
										console.log(errormsg);
										for (var j = 0; j < list[0].data[i].length; j++) {
											if (j == list[0].data[i].length - 1)
												errormsg += list[0].data[i][j] + "<br/>";
											else
												errormsg += list[0].data[i][j] + ",";
										}
										if (i == list[0].data.length - 1) {
											var currentdate = new Date();
											var datetime = currentdate.getFullYear() + "/" + (currentdate.getMonth() + 1) + "/" + currentdate.getDate() + " "
												+ currentdate.getHours() + ":"
												+ currentdate.getMinutes() + ":"
												+ currentdate.getSeconds();
											res.render('talist_putupload_add', {
												'id': req.session.userid,
												'modelList': modelList,
												'navMenuList': navMenuList,
												'mgrMenuList': mgrMenuList,
												'successnum': successnum,
												'errormsg': errormsg,
												'errornum': errornum,
												'mdID': mdID,
												'total': total,
												'dispaly':
													'block',
												'datetime': datetime
											});
										}

										checkandinsert(i + 1);
									}
									else {
										console.log("INSERT INTO cu_SentListDet (mdID,batID,sentListID,uCustID,uLicsNO,uVIN,rptKey) values('" + mdID + "','" + batID + "'," + newindex + ",'" + list[0].data[i][CustIDindex] + "','" + list[0].data[i][LISCNOindex] + "','" + list[0].data[i][VINindex] + "','" + data1 + "')");
										db.query("INSERT INTO cu_SentListDet (mdID,batID,sentListID,uCustID,uLicsNO,uVIN,rptKey) values('" + mdID + "','" + batID + "'," + newindex + ",'" + list[0].data[i][CustIDindex] + "','" + list[0].data[i][LISCNOindex] + "','" + list[0].data[i][VINindex] + "','" + data1 + "')", function (err, recordset) {
											if (err) {
												console.log(err);
											}
											successnum++;
											if (i == list[0].data.length - 1) {
												var datetime = currentdate.getFullYear() + "/" + (currentdate.getMonth() + 1) + "/" + currentdate.getDate() + " "
													+ currentdate.getHours() + ":"
													+ currentdate.getMinutes() + ":"
													+ currentdate.getSeconds();
												res.render('talist_putupload_add', {
													'id': req.session.userid,
													'modelList': modelList,
													'navMenuList': navMenuList,
													'mgrMenuList': mgrMenuList,
													'successnum': successnum,
													'errormsg': errormsg,
													'errornum': errornum,
													'mdID': mdID,
													'total': total,
													'dispaly': 'block',
													'datetime': datetime
												});
											}

											checkandinsert(i + 1);
										});
									}
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
		router.get('/talist_putuploadAdd', function (req, res) {
			if (req.session.userid && req.session.userid != '') {
				var mdID = req.query.mdID || '';
				var batID = req.query.batID || '';
				var batchlist;
				var sentListCateg;
				var sentListChannel;
				var items;
				var p1 = new Promise(function (resolve, reject) {
					db.query("SELECT batID,batName FROM md_Batch where mdID ='" + mdID + "' and isClosed <> 'Y'  and isDel <> 'Y' order by updTime desc ", function (err, recordset) {
						if (err) {
							console.log(err);
							reject(2);
						}
						batchlist = recordset.recordset;
						resolve(1);
					});
				});
				var p2 = new Promise(function (resolve, reject) {
					db.query("SELECT codeValue,codeLabel FROM sy_CodeTable where codeGroup = 'sentListCateg'", function (err, recordset) {
						if (err) {
							console.log(err);
							reject(2);
						}
						sentListCateg = recordset.recordset;
						resolve(2);
					});
				});
				var p3 = new Promise(function (resolve, reject) {
					db.query("SELECT codeValue,codeLabel FROM sy_CodeTable where codeGroup = 'sentListChannel'", function (err, recordset) {
						if (err) {
							console.log(err);
							reject(2);
						}
						sentListChannel = recordset.recordset;
						resolve(3);
					});
				});
				Promise.all([p1, p2, p3]).then(function (results) {
					db.query("SELECT mdName FROM md_Model where mdID = '" + mdID + "'", function (err, recordset) {
						if (err) {
							console.log(err);
						}
						var modelList = req.session.modelList;
						var navMenuList = req.session.navMenuList;
						var mgrMenuList = req.session.mgrMenuList;
						items = recordset.recordset;
						res.render('talist_putupload_add', {
							'id': req.session.userid,
							'modelInfo': items[0],
							'funcName': '投放名單上傳',
							'modelList': modelList,
							'navMenuList': navMenuList,
							'mgrMenuList': mgrMenuList,
							'batchlist': batchlist,
							'sentListCateg': sentListCateg,
							'sentListChannel': sentListChannel,
							'mdID': mdID
						});
					});
				}).catch(function (e) {
					console.log(e);
				});
			}
			else {
				res.render('index', { 'title': req.session.userid });
			}
		});





	};

	return talist_putuploadRoute;
}(Route_1.BaseRoute));
exports.talist_putuploadRoute = talist_putuploadRoute;

// # sourceMappingURL=Index.js.map
*/