'use strict';

// const winston = require('winston');

module.exports = {
  up: (query, DataTypes) => {
    return query.createTable('sy_DnldLog', {
      logID: {
        type: DataTypes.BIGINT,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
      },
      queryID: {
        type: DataTypes.STRING(20),
        allowNull: false
      },
      logFilename: {
        type: DataTypes.STRING(50)
      },
      userId: {
        type: DataTypes.STRING(50),
        allowNull: false
      },
      dnldDatetime: {
        type: DataTypes.TIMESTAMP,
        allowNull: false
      }
    })
  }
};
