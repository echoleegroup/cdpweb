"use strict";
var config={
		user:'cdp',
		password:'1q2w3e4r',
		server:'10.57.200.40',   //這邊要注意一下!!
		database:'poc',
		options: {
			encrypt: true
		}
};
var sql = require('mssql');
sql.connect(config,function (err) {
		if(err) console.log(err);
		else console.log("mssql connected");
});
var db = new sql.Request();
exports.db = db;

//# sourceMappingURL=config.js.map
