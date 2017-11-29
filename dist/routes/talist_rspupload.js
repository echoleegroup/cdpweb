"use strict";
var config  = require("../configuration/newconfig");
var db = config.db;
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Route_1 = require("./Route");
var fs = require('fs')
var multer = require('multer') 
var upload = multer({dest:'./public/upload/'}); 
var xlsx = require("node-xlsx");
var talist_rspuploadRoute = (function (_super) {
    __extends(talist_rspuploadRoute, _super);
    function talist_rspuploadRoute() {
        return _super.call(this) || this;
    }
    talist_rspuploadRoute.create = function (router) {
        console.log('[talist_rspuploadRoute::create] Creating talist_rspupload route.');
		router.post('/talist_rspuploadAddact',upload.single('uploadingFile') ,function (req, res) {
			if( req.session.userid && req.session.userid != ''){
					var mdID = req.body.mdID ||'' ;
					var batID = req.body.batID ||'' ;
					
					var sentListChannel = req.body.sentListChannel ||'' ;
					var startDate =req.body.startDate ||'' ;
					var sentListName =req.body.sentListName ||'' ;
					var sentListDesc =req.body.sentListDesc ||'' ;
					var optradio =req.body.optradio ||'' ;
		            var filepath ='';
					var VINindex,CustIDindex,LISCNOindex,RespTimeindex ;
					var key ='' ;
					var newindex ;
					var total;
					var successnum = 0 ;
					var errornum = 0 ;
					var respListTime ;
					var errormsg ='錯誤資訊<br/>';
					var allmsg = '' ;
					if( optradio == 'car')
						key = 'LISCNO' ;
					else if( optradio == 'uID')
						key = 'CustID' ;
					else
						key = 'VIN' ;
					var keyindex = 0 ;
					var p1 = new Promise(function(resolve, reject){function getnewindex(mdID,callback){
							db.query("INSERT INTO cu_RespListMst(mdID,batID,respListName,respListChannel,respListDesc,respListTime,updTime,updUser) values('"+mdID+"','"+batID+"','"+sentListName+"','"+sentListChannel+"','"+sentListDesc+"','"+startDate+"',GETDATE(),'"+req.session.userid+"')" ,function(err,recordset){
								if(err) {
									console.log(err);
									reject(2);
								}
								callback(null, 0);
								
						
							});
							
						}
						getnewindex(mdID,function(err,data){
							 db.query("SELECT TOP 1 respListID,convert(varchar, respListTime, 120)respListTime FROM cu_RespListMst where mdID ='"+mdID+"' and batID ='"+batID+"' order by respListID desc ",function(err,recordset){
								newindex = recordset.recordset[0].respListID ;
								respListTime = recordset.recordset[0].respListTime
								resolve(1);
							 });
						 });
					});
					var p2 = new Promise(function(resolve, reject){
						var file=req.file; 
						console.log("名稱︰%s",file.originalname);
						 console.log("mime︰%s",file.mimetype); 
						// 以下代碼得到檔案後綴
						var name=file.originalname; 
						var nameArray=name.split(''); 
						var nameMime=[]; 
						var l=nameArray.pop(); 
						nameMime.unshift(l); 
						while(nameArray.length!=0&&l!='.'){
							l=nameArray.pop(); 
							nameMime.unshift(l);
						} // Mime是檔案的後綴 Mime=nameMime.join('');
							// console.log(Mime); res.send("done"); //重命名檔案
							// 加上檔案後綴
							// fs.renameSync('./upload/'+file.filename,'./upload/'+file.filename+Mime);
						
						filepath = file.path ;
							resolve(1);						
					});
					Promise.all([p1,p2]).then(function (results) {
						var list = xlsx.parse(filepath);
						total = list[0].data.length-1 ;
						for( var i = 0 ; i < list[0].data[0].length ;i++ ) {
							if(list[0].data[0][i] == "LISCNO" ) {
								LISCNOindex = i;
								if( key == 'LISCNO')
									keyindex = i ;
							}
							else if(list[0].data[0][i] == "CustID"){
								CustIDindex = i ;
								if( key == 'CustID')
									keyindex = i ;
							}
							else if(list[0].data[0][i] == "VIN"){
								VINindex = i ;
								if( key == 'VIN')
									keyindex = i ;
							}
							else if(list[0].data[0][i] == "RespTime"){
								RespTimeindex = i ;
								
							}
						}
						for( var i = 1 ; i < list[0].data.length ; i++ ) {

							if( list[0].data[i][keyindex] == undefined || list[0].data[i][keyindex] == '') {
								errornum++ ;
								var linenum = i + 1 ;
								errormsg+= 'Line ' +  linenum.toString()+ ','
								for( var j = 0 ; j < list[0].data[i].length ; j++ ) {
									if( j == list[0].data[i].length-1) 
										errormsg+= list[0].data[i][j] +"<br/>";
									else 
										errormsg+= list[0].data[i][j] + ",";
								}		
							}
							else {
								var datatime = '';
								if( list[0].data[i][RespTimeindex] == undefined ) 
									datatime = respListTime ;
								else 
									datatime = list[0].data[i][RespTimeindex];
										successnum++ ;
										console.log("INSERT INTO cu_RespListDet (mdID,batID,respListID,uCustID,uLicsNO,uVIN,uRespTime,rptKey) values('"+mdID+"','"+batID+"',"+newindex+",'"+list[0].data[i][CustIDindex]+"','"+list[0].data[i][LISCNOindex]+"','"+list[0].data[i][VINindex]+"','"+datatime+"','0')");
										db.query("INSERT INTO cu_RespListDet (mdID,batID,respListID,uCustID,uLicsNO,uVIN,uRespTime,rptKey) values('"+mdID+"','"+batID+"',"+newindex+",'"+list[0].data[i][CustIDindex]+"','"+list[0].data[i][LISCNOindex]+"','"+list[0].data[i][VINindex]+"','"+datatime+"','0')" ,function(err,recordset){
											if(err) {
												console.log(err);
											}
															
										});
									
							
							}
						}
						var currentdate = new Date(); 
						var datetime = currentdate.getFullYear() +"/" + (currentdate.getMonth()+1)  + "/" + currentdate.getDate() +" "
                        + currentdate.getHours() + ":"  
                        + currentdate.getMinutes() + ":" 
                        + currentdate.getSeconds();
						 var modellist = req.session.modellist ;
						 var menuJson = req.session.menuJson ;
						 res.render(VIEW + 'talist_rspupload_add', {'id' : req.session.userid, 'modellist' :JSON.stringify(modellist), 'menuJson':JSON.stringify(menuJson),"successnum":successnum,"errormsg":errormsg,"errornum":errornum,'mdID':mdID,'total':total,'dispaly':'block','datetime':datetime});
						}).catch(function (e){
							console.log(e);
					});	
				
			}
			else{
				res.render(VIEW + 'index', {'title' : req.session.userid, 'items' : ""});
			}
        });
		router.get('/talist_rspuploadAdd', function (req, res) {
			if( req.session.userid && req.session.userid != ''){
				var mdID = req.query.mdID ||'' ;
				var batID = req.query.batID ||'' ;
				var batchlist  ;
				var sentListChannel;
				var items;
				var p1 = new Promise(function(resolve, reject){db.query("SELECT batID,batName FROM md_Batch where mdID ='"+mdID+"' and isClosed <> 'Y'  and isDel <> 'Y' order by updTime desc ",function(err,recordset){
							if(err) {
								console.log(err);
								reject(2);
							}
							batchlist = recordset.recordset;
							resolve(1);
						});
				});
				
				var p3 = new Promise(function(resolve, reject){db.query("SELECT codeValue,codeLabel FROM sy_CodeTable where codeGroup = 'RespListChannel'",function(err,recordset){
							if(err) {
								console.log(err);
								reject(2);
							}
							sentListChannel = recordset.recordset;
							resolve(3);
						});
				});
				Promise.all([p1,p3]).then(function (results) {
						db.query("SELECT mdName FROM md_Model where mdID = '"+mdID+"'" ,function(err,recordset){
							if(err) { 
								console.log(err);
							}
							var modellist = req.session["modellist"]  ;
							var menuJson = req.session["menuJson"]  ;
							items = recordset.recordset;
							res.render(VIEW + 'talist_rspupload_add', {'id' : req.session.userid, 'items' : items, 'modellist' :JSON.stringify(modellist), 'menuJson':JSON.stringify(menuJson),'batchlist':batchlist,'sentListChannel':sentListChannel,'mdID':mdID});
						});
						}).catch(function (e){
							console.log(e);
				});		
			}
			else{
				res.render(VIEW + 'index', {'title' : req.session.userid});
			}
        });


		
		
       
    };
    
    return talist_rspuploadRoute;
}(Route_1.BaseRoute));
exports.talist_rspuploadRoute = talist_rspuploadRoute;

// # sourceMappingURL=Index.js.map
