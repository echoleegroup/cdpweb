const mssql = require('mssql');
const db_info = require("../app-config").get("SQL_SERVER_INFO");

const config = {
  user: process.env.DATABASE_USERNAME,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  server: db_info.host,   //這邊要注意一下!!
  options: db_info.options,
  requestTimeout: 900000,
  pool: {
    max: 10,
    min: 2,
    idleTimeoutMillis: 30000
  }
};
const pool = new mssql.ConnectionPool(config);
module.exports = pool;