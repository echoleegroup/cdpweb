"use strict";
const db_info = require("../config/app-config").get("SQL_SERVER_INFO");
var config={
    user: db_info.USER,
    password: db_info.PWD,
    server: db_info.HOST,   //這邊要注意一下!!
    database: db_info.DATABASE,
    options: db_info.OPTIONS
};
var sql = require('mssql');
sql.connect(config,function (err) {
    if(err) console.log(err);
    else console.log("mssql connected");
});
var db = new sql.Request();
exports.db = db;

//# sourceMappingURL=config.js.map
