"use strict";
var db  = require("../utils/sql-server-connector").db;
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Route_1 = require("./Route");
var fs = require('fs')
var multer = require('multer') 
var upload = multer({dest:'./dist/public/upload/'}); 
var xlsx = require("node-xlsx");
var NCBSDataRoute = (function (_super) {
    __extends(NCBSDataRoute, _super);
    function NCBSDataRoute() {
        return _super.call(this) || this;
    }
    NCBSDataRoute.create = function (router) {
        console.log('[NCBSDataRoute::create] Creating NCBSData route.');
		router.post('/NCBSDataUploadAct',upload.single('uploadingFile') ,function (req, res) {
			if( req.session.userid && req.session.userid != ''){
					var client = req.body.client ||'' ;
					var ncbsYear = req.body.ncbsYear ||'';
					var ncbsQus = req.body.ncbsQus || '' ;
					var ncbsName = req.body.ncbsName || '' ;
					var ncbsSdt = req.body.ncbsSdt || '' ;
					var ncbsEdt = req.body.ncbsEdt || '' ;
					var ncbsDesc = req.body.ncbsDesc || '' ;
		            var filepath ='';
					var uLicsNOindex ;
					var keyIndex = 0 ;
					var origName = "" ;
					var uniqName = "" ;
					var anstitle = '';
					var anscontent = '' ;
					var total;
					var successnum = 0 ;
					var errornum = 0 ;
					var updtime ;
					var errormsg ='錯誤資訊\r\n';
					var allmsg = '' ;
					var modellist = req.session.modellist ;
					var menuJson = req.session.menuJson ;
					var ncbsID = 0 ;
					var uLicsNO = '';
					var file=req.file; 
						// 以下代碼得到檔案後綴
					origName = file.originalname; 
					var name=file.originalname; 
					var nameArray=name.split(''); 
					var nameMime=[]; 
					var l=nameArray.pop(); 
					nameMime.unshift(l); 
					// Mime是檔案的後綴 Mime=nameMime.join('');
							// console.log(Mime); res.send("done"); //重命名檔案
							// 加上檔案後綴
							// fs.renameSync('./upload/'+file.filename,'./upload/'+file.filename+Mime);
					uniqName = file.filename;
					filepath = file.path ;
					var list = xlsx.parse(filepath);
					
					
					var p1 = new Promise(function(resolve, reject){
						total = list[0].data.length-1 ;
						for( var i = 0 ; i < list[0].data[0].length ;i++ ) {
							if(list[0].data[0][i] == "LICSNO" ) {
								keyIndex = i;
							}
							if( i == list[0].data[0].length - 1 ) 
								anstitle+= list[0].data[0][i] ;
							else
								anstitle+= list[0].data[0][i] + "," ;
						}
						function insertMst(origName,uniqName,callback){
							db.query("INSERT INTO cu_NCBSMst(ncbsName,Client,ncbsYear,ncbsDesc,ncbsQus,origName,uniqName,ncbsSdt,ncbsEdt,ncbsStruc,crtTime,updTime,updUser,funcCatge) VALUES('"+ncbsName+"','"+client+"','"+ncbsYear+"','"+ncbsDesc+"','"+ncbsQus+"','"+origName+"','"+uniqName+"','"+ncbsSdt+"','"+ncbsEdt+"','"+anstitle+"',GETDATE(),GETDATE(),'"+req.session.userid+"','NCBS')",function(err,recordset){
								if (err) 
									callback(err, null);
								else 
									callback(null, 0);
							});
						}
						insertMst(origName,uniqName,function(err,data){
							if (err) {
								console.log("ERROR : ",err);
								reject(1)
							}
							else{
								db.query("SELECT TOP 1 ncbsID FROM cu_NCBSMst order by ncbsID desc  ",function(err,recordset){
									if(err) 
										console.log(err);						
									ncbsID = recordset.recordset[0].ncbsID;
									resolve(2);	
								});
							}	
						});
					});
					
					
					Promise.all([p1]).then(function (results) {
						var i = 1 
						checkandinsert(i);
						function checkandinsert(i) {
							if( i <  list[0].data.length ) {
								if( list[0].data[i][keyIndex] == "") {
									errornum++ ;
									var linenum = i + 1 ;
									errormsg+= 'Line ' +  linenum.toString()+ ','
									for( var j = 0 ; j < list[0].data[i].length ; j++ ) {
										if( j == list[0].data[i].length-1) 
											errormsg+= list[0].data[i][j] +"\r\n";
										else 
											errormsg+= list[0].data[i][j] + ",";
									}
									if( i == list[0].data.length -1 ) {
										var datetime = currentdate.getFullYear() +"/" + (currentdate.getMonth()+1)  + "/" + currentdate.getDate() +" "
												+ currentdate.getHours() + ":"  
												+ currentdate.getMinutes() + ":" 
												+ currentdate.getSeconds();
										res.redirect("/NCBSData/NCBSDataEdit?ncbsID="+ncbsID+"&successnum="+successnum+"&errormsg="+errormsg+"&errornum="+errornum+"&total="+total+"&dispaly=block&datetime="+datetime);
									}
									
									checkandinsert(i+1);
														
								}
								else {
									function checkdata(keyIndex,callback) {
										db.query("SELECT CustID_u FROM cu_LiscnoIndex where LISCNO  = '"+list[0].data[i][keyIndex]+"'",function(err,recordset){
											if(err) 
												console.log(err);
											if( recordset.rowsAffected == 0 ) 
												callback(null, "0");
											else 
												callback(null,recordset.recordset[0].CustID_u);
										});
									}
									checkdata(keyIndex,function(err,data1){
										anscontent ='';
										uLicsNO = list[0].data[i][keyIndex] ;
										for( var j = 0 ; j < list[0].data[i].length ; j++ ) {
											if( j == list[0].data[i].length-1) 
												anscontent+= list[0].data[i][j] ;
											else 
												anscontent+= list[0].data[i][j] + ",";
										}
										if (err) 
											console.log("ERROR : ",err);
										if( data1 == "0" ) {
											errornum++ ;
											var linenum = i + 1 ;
											errormsg+= 'Line ' +  linenum.toString()+ ','
											for( var j = 0 ; j < list[0].data[i].length ; j++ ) {
												if( j == list[0].data[i].length-1) 
													errormsg+= list[0].data[i][j] +"\r\n";
												else 
												errormsg+= list[0].data[i][j] + ",";
											}
											if( i == list[0].data.length -1 ) {
												var currentdate = new Date(); 
												var datetime = currentdate.getFullYear() +"/" + (currentdate.getMonth()+1)  + "/" + currentdate.getDate() +" "
													+ currentdate.getHours() + ":"  
													+ currentdate.getMinutes() + ":" 
													+ currentdate.getSeconds();
												res.redirect("/NCBSData/NCBSDataEdit?ncbsID="+ncbsID+"&successnum="+successnum+"&errormsg="+errormsg+"&errornum="+errornum+"&total="+total+"&dispaly=block&datetime="+datetime);
											}
											checkandinsert(i+1);
										}
										else {
											db.query("INSERT INTO cu_NCBSDet (ncbsID,uLicsNO,uData)VALUES("+ncbsID+",'"+uLicsNO+"','"+anscontent+"')" ,function(err,recordset){
												if(err) {
													console.log(err);
												}
												successnum++ ;	
												if( i == list[0].data.length-1 ) {	
													var datetime = currentdate.getFullYear() +"/" + (currentdate.getMonth()+1)  + "/" + currentdate.getDate() +" "
														+ currentdate.getHours() + ":"  
														+ currentdate.getMinutes() + ":" 
														+ currentdate.getSeconds();

													res.redirect("/NCBSData/NCBSDataEdit?ncbsID="+ncbsID+"&successnum="+successnum+"&errormsg="+errormsg+"&errornum="+errornum+"&total="+total+"&dispaly=block&datetime="+datetime);
												}
												checkandinsert(i+1);									
											});
										}
									});
								}
							}
						}
					}).catch(function (e){
							console.log(e);
				});
				
			}
			else{
				res.render('index', {'title' : req.session.userid, 'items' : ""});
			}
        });
		router.get('/NCBSDataEdit', function (req, res) {
			var outerListID =  req.query.outerListID || '';
			var successnum = req.query.successnum || '';
			var errormsg = req.query.errormsg ||'';
			var errornum = req.query.errornum ||'' ;
			var total = req.query.total ||'' ;
			var dispaly = req.query.dispaly ||'';
			var datetime = req.query.datetime ||'';
			var funcCatge ;
			var modellist = req.session["modellist"]  ;
			var menudisplay = req.session["menuJson"]  ;
			var atag ;
			var mtag ;
			var maininfo ;
			if( req.session.userid && req.session.userid != ''){
				var p1 = new Promise(function(resolve, reject){db.query("SELECT colm.outerListName,colm.Client,colm.funcCatge,sc.codeLabel,colm.outerListDesc,convert(varchar,colm.outerListSdt,111)outerListSdt,convert(varchar,colm.outerListEdt,111)outerListEdt,colm.isDel,convert(varchar,colm.updTime,111)updTime,colm.updUser,(select count(*) from cu_OuterListDet cold where cold.outerListID = colm.outerListID)total FROM cu_OuterListMst colm left join sy_CodeTable sc on sc.codeGroup = 'funcCatge' and sc.codeValue = colm.funcCatge where outerListID = "+outerListID,function(err,recordset){
							if(err) {
								console.log(err);
								reject(2);
							}
							maininfo = recordset.recordset;
							resolve(1);
						});
				});
				Promise.all([p1]).then(function (results) {
						res.render('FeedDataEdit', {'id' : req.session.userid, 'modellist' :JSON.stringify(modellist), 'menuJson':JSON.stringify(menudisplay),'maininfo':maininfo,'outerListID':outerListID,'dispaly':dispaly,'successnum':successnum,'errormsg':errormsg,'errornum':errornum,'total':total,'datetime':datetime});
						}).catch(function (e){
							console.log(e);
				});	
				
			}
			else{
				res.render('index', {'title' : req.session.userid});
			}
        });
		router.get('/NCBSDataUpload', function (req, res) {
			var modellist = req.session["modellist"]  ;
			var menudisplay = req.session["menuJson"]  ;
			if( req.session.userid && req.session.userid != ''){
				res.render('NCBSData_upload', {'id' : req.session.userid, 'modellist' :JSON.stringify(modellist), 'menuJson':JSON.stringify(menudisplay)});
			}
			else{
				res.render('index', {'title' : req.session.userid});
			}
        });


    };
    return NCBSDataRoute;
}(Route_1.BaseRoute));
exports.NCBSDataRoute = NCBSDataRoute;


