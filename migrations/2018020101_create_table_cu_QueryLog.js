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
        autoIncrement: true,
        allowNull: false
      },
      menuCode: {
        type: DataTypes.STRING(20),
        allowNull: false,
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
        type: DataTypes.DATE,
        allowNull: false
      },
      queryTime: {
        type: DataTypes.DATE
      },
      queryResponseTime: {
        type: DataTypes.DATE
      },
      queryResultFilename: {
        type: DataTypes.STRING(50)
      }
    })
  }
};
