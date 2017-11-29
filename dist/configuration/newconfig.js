"use strict";
var config={
		user:'sa',
		password:'1q2w3e4r',
		server:'127.0.0.1',   //這邊要注意一下!!
		database:'poc'
};
var sql = require('mssql');
sql.connect(config,function (err) {
		if(err) console.log(err);
		else console.log("mssql connected");
});
var db = new sql.Request();
exports.db = db;

//# sourceMappingURL=config.js.map
