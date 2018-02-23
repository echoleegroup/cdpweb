'use strict';

// const winston = require('winston');

module.exports = {
  up: (query, DataTypes) => {
    return query.createTable('cu_IntegratedQueryTask', {
      taskID: {
        type: DataTypes.BIGINT,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
      },
      queryID: {
        type: DataTypes.STRING(20)
      },
      queryScript: {
        type: DataTypes.TEXT
      },
      status: {
        type: DataTypes.STRING(50)
      },
      crtTime: {
        type: DataTypes.DATE
      },
      updTime: {
        type: DataTypes.DATE
      },
      updUser: {
        type: DataTypes.STRING(150)
      }
    })
  }
};
