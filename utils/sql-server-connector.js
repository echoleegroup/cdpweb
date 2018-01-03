"use strict";
const db_info = require("../app-config").get("SQL_SERVER_INFO");
var config = {
  user: process.env.DATABASE_USERNAME,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  server: db_info.host,   //這邊要注意一下!!
  options: db_info.options
};
var sql = require('mssql');
sql.connect(config, function (err) {
  if (err) console.log(err);
  else console.log("mssql connected");
});
var db = new sql.Request();
exports.db = db;

//# sourceMappingURL=config.js.map
