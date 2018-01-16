const winston = require('winston');
const Q = require('q');
const _ = require('lodash');
const mssql = require('mssql');
const db_info = require("../app-config").get("SQL_SERVER_INFO");

//---mssql
const config = {
  user: process.env.DATABASE_USERNAME,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  server: db_info.host,   //這邊要注意一下!!
  options: db_info.options,
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000
  }
};

const pool = new mssql.ConnectionPool(config).connect((err) => {
  err && winston.error('connect db failed: %j', err);
});
winston.info('mssql connection pool established.');

const execParameterizedSql = (sql, params = {}, callback = (err, resultSet) => { }) => {
  let request = pool.request();
  _.reduce(params || {}, (_request, value, key) => {
    return _request.input(key, value.type, value.value);
  }, request)
    .query(sql)
    .then((result) => {
      callback(null, (result.recordsets.length > 1)? result.recordsets: result.recordset);
    }).catch((err) => {
    callback(err);
  });
};

const _that = {
  TYPES: mssql.TYPES,
  execSql: (sql, callback = (err, resultSet) => { }) => {
    pool.request().query(sql).then((result) => {
      callback(null, result.recordset);
    }).catch(err => {
      callback(err);
    });
  },
  queryRequest: () => {
    let inputs = {};
    const _this = {
      setInput: (name, type, value) => {
        inputs[name] = {type, value};
        return _this;
      },
      executeQuery: (sql, callback) => {
        execParameterizedSql(sql, inputs, callback);
      }
    };
    return _this;
  },
  preparedStatement: () => {
    let ps = new mssql.PreparedStatement(pool);
    const _this = {
      setType: (param, type) => {
        ps.input(param, type);
        return _this;
      },
      execute: (sql, params, callback = (err, resultSet) => { }) => {
        ps.prepare(sql).then(() => {
          return ps.execute(params);
        }).then((result) => {
          // winston.info('result.recordset: %j', result.recordset);
          //ps.prepared && ps.unprepare();
          callback(null, (result.recordsets.length > 1)? result.recordsets: result.recordset);
        }).catch((err) => {
          //ps.prepared && ps.unprepare();
          callback(err);
        }).then(() => {
          winston.info('===finally');
          ps.prepared && ps.unprepare();
        });
      },
      release: (callback = (err) => { }) => {
        ps.prepared && ps.unprepare(callback);
      }
    };
    return _this;
  }
};

module.exports = _that;