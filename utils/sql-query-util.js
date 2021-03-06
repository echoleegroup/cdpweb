const winston = require('winston');
const Q = require('q');
const _ = require('lodash');
const mssql = require('mssql');

const pool = require('./connection-pool');

const execParameterizedSql = (sql, params = {}, callback = (err, resultSet) => { }) => {
  let request = pool.request();
  _.reduce(params || {}, (_request, value, key) => {
    return _request.input(key, value.type, value.value);
  }, request)
    .query(sql)
    .then(result => {
      callback(null, result);
    }).catch((err) => {
      winston.error('execParameterizedSql error: ', err);
      callback(err);
    });
};

const streamParameterizedSql = (sql, params = {}) => {
  let request = pool.request();
  request.stream = true;
  _.reduce(params || {}, (_request, value, key) => {
    return _request.input(key, value.type, value.value);
  }, request)
    .query(sql);

  return request;
};

const _that = {
  TYPES: mssql.TYPES,
  execSql: (sql, callback = (err, resultSet) => { }) => {
    pool.request().query(sql).then(result => {
      callback(null, result.recordset);
    }).catch(err => {
      callback(err);
    });
  },
  queryRequest: () => {
    let inputs = {};
    const _this = {
      setInput: (name, type, value) => {
        // winston.info('sql-query-util.queryRequest.setInput: ', {name, type, value});
        inputs[name] = {type, value};
        return _this;
      },
      executeQuery: (sql, callback) => {
        // winston.info('sql-query-util.queryRequest.executeQuery.sql: ', sql);
        Q.nfcall(execParameterizedSql, sql, inputs).then(result => {
          callback(null, (result.recordsets.length > 1)? result.recordsets: result.recordset);
        }).fail(err => {
          callback(err);
        });
      },
      executeUpdate: (sql, callback) => {
        // winston.info('sql-query-util.queryRequest.executeQuery.sql: ', sql);
        Q.nfcall(execParameterizedSql, sql, inputs).then(result => {
          callback(null, (result.rowsAffected.length > 1)? result.rowsAffected: result.rowsAffected[0]);
        }).fail(err => {
          winston.error('sql util executeUpdate error: ', err);
          callback(err);
        });
      },
      streamExecute: (sql) => {
        return streamParameterizedSql(sql, inputs);
      }
    };
    return _this;
  },
  preparedStatement: (transaction) => {
    const ps = new mssql.PreparedStatement(transaction || pool);

    const _this = {
      setType: (param, type) => {
        ps.input(param, type);
        return _this;
      },
      prepare: (sql) => {
        return ps.prepare(sql);
      },
      execute: (params, callback = () => {}) => {
        ps.execute(params).then(result => {
          callback(null, (result.recordsets.length > 1)? result.recordsets: result.recordset);
        }).fail(err => {
          //ps.prepared && ps.unprepare();
          callback(err);
        });
      },
      release: () => {
        return ps.unprepare();
      }
    };
    return _this;
  }
};

module.exports = _that;