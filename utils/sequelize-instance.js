const appConfig = require('../app-config');
const Sequelize = require('sequelize');

const SQL_SERVER_INFO = appConfig.get('SQL_SERVER_INFO');
module.exports = new Sequelize(
  process.env.DATABASE_NAME,
  process.env.DATABASE_USERNAME,
  process.env.DATABASE_PASSWORD,
  {
    host: SQL_SERVER_INFO.host,
    port: SQL_SERVER_INFO.port,
    dialect: SQL_SERVER_INFO.dialect,
    dialectOptions: SQL_SERVER_INFO.options
  }
);