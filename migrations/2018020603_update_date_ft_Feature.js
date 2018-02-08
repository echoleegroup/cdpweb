'use strict';

// const winston = require('winston');
const Q = require('q');

const FEATURE_DATATYPE_TO_INPUT_TYPE = {
  //digit
  bigint: 'number',
  bit: 'number',
  decimal: 'number',
  int: 'number',
  money: 'number',
  numeric: 'number',
  smallint: 'number',
  smallmoney: 'number',
  tinyint: 'number',
  //float
  float: 'number',
  real: 'number',
  //date
  date: 'date',
  datetime2: 'date',
  datetime: 'date',
  datetimeoffset: 'date',
  smalldatetime: 'date',
  time: 'date',
  //literal
  char: 'text',
  text: 'text',
  varchar: 'text',
  //string
  nchar: 'text',
  ntext: 'text',
  nvarchar: 'text'
};

module.exports = {
  up: (query, DataTypes, sequelize) => {
    return sequelize.query('SELECT dataType, featID FROM ft_Feature').then(results => {
      console.log('results: ', results);
      return results[0].reduce((promise, row) => {
        return promise.then(result => {
          return sequelize.query(`UPDATE ft_Feature SET uiInputType = '${FEATURE_DATATYPE_TO_INPUT_TYPE[row.dataType]}' WHERE featID = '${row.featID}'`);
        });
      }, Promise.resolve());
    });
  }
};
