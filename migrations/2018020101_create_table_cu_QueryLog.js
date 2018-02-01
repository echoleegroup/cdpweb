'use strict';

// const winston = require('winston');

module.exports = {
  up: (query, DataTypes) => {
    return query.createTable('cu_QueryLog', {
      queryID: {
        type: DataTypes.STRING(20),
        primaryKey: true,
        allowNull: false
      },
      seq: {
        type: DataTypes.BIGINT,
        autoIncrement: true
      },
      menuCode: {
        type: DataTypes.STRING(20),
        allowNull: false
      },
      criteria: {
        type: DataTypes.TEXT
      },
      exportFeats: {
        type: DataTypes.TEXT
      },
      exportFilters: {
        type: DataTypes.TEXT
      },
      reserve1: {
        type: DataTypes.TEXT
      },
      reserve2: {
        type: DataTypes.TEXT
      },
      reserve3: {
        type: DataTypes.TEXT
      },
      requestTime: {
        type: DataTypes.TIMESTAMP,
        allowNull: false
      },
      queryTime: {
        type: DataTypes.TIMESTAMP
      },
      queryResponseTime: {
        type: DataTypes.TIMESTAMP
      },
      queryResutlFilename: {
        type: DataTypes.STRING(50)
      }
    })
  }
};
