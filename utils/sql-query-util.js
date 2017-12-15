const winston = require('winston');
const Q = require('q');
const _ = require('lodash');
const mssql = require('mssql');
const db_info = require("../config/app-config").get("SQL_SERVER_INFO");

//---mssql
const config = {
  user: db_info.USER,
  password: db_info.PWD,
  server: db_info.HOST,   //這邊要注意一下!!
  database: db_info.DATABASE,
  options: db_info.OPTIONS,
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000
  }
};

module.exports = (() => {
  const pool = new mssql.ConnectionPool(config).connect((err) => {
    winston.error('connect db failed: %j', err);
    throw e;
  });
  winston.info('mssql connection pool established.');

  return {
    execSql: (sql, callback = (err, resultSet) => { }) => {
      pool.request().query(sql).then((result) => {
        callback(null, result.recordsets);
      }).catch(err => {
        callback(err);
      });
    },
    execSqlByParams: (sql, params = {}, callback = (err, resultSet) => { }) => {
      let request = pool.request();
      _.reduce(params, (_request, value, key) => {
        return _request.input(key, value.type, value.value);
      }, request)
      .query(sql)
      .then((result) => {
        callback(null, result.recordsets);
      }).catch((err) => {
        callback(err);
      });
    },
    preparedStatement: () => {
      let ps = new mssql.PreparedStatement(pool);
      return _this = {
        setType: (param, type) => {
          ps.input(param, type);
          return _this;
        },
        execute: (sql, params, callback = (err, resultSet) => { }) => {
          ps.prepare(sql).then(() => {
            return ps.execute(params);
          }).then((result) => {
            //winston.info('result.recordsets: %j', result.recordsets);
            //ps.prepared && ps.unprepare();
            callback(null, result.recordsets);
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
      //return _this;
    }
  };
})();



/*
//---tedious
const connectionConfig = {
    userName: db_info.USER,
    password: db_info.PWD,
    server: db_info.HOST,   //這邊要注意一下!!
    //database: db_info.DATABASE,
    options: Object.assign({}, db_info.OPTIONS, {
        database: db_info.DATABASE,
        rowCollectionOnRequestCompletion: true})
};
const ConnectionPool = require('tedious-connection-pool');
const Request = require('tedious').Request;

const poolConfig = {
    min: 2,
    max: 4,
    log: true
};

module.exports = (() => {
    //create the pool
    let pool = new ConnectionPool(poolConfig, connectionConfig);
    pool.on('error', function(err) {
        winston.error('create connection pool failed: %s', err);
        throw err;
    });

    return {    
        connect: (callback=()=>{}) => {
            pool.acquire(callback);
        },
        execSql: (sql, callback=(err, resultSet)=>{}) => {
            let connector = Q.nfcall(pool.acquire);
            connector.then(connection => {
                let request = new Request(sql, (err, eowCount, resultSet) => {
                    connection.release();
                    callback(err, resultSet);
                });
                connection.execSql(request);
            });
        },
        execSqlByParams: (sql, params={}, callback=(err, resultSet)=>{}) => {
            pool.acquire((err, connection) => {
                let request = new Request(sql, (err, rowCount, resultSet) => {
                    connection.release();
                    callback(err, resultSet);
                });
                for(let key in params) {
                    let p = params[key];
                    console.log('parameter: key=%s, type=%s, value=%s', key, p.type, p.value);
                    request.addParameter(key, p.type, p.value);
                }
                connection.execSql(request); 
            });
        }
    };
})();
*/