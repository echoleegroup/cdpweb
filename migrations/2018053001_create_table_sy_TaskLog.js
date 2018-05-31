'use strict';

// const winston = require('winston');

module.exports = {
  up: (query, DataTypes) => {
    return query.createTable('sy_TaskLog', {
      logID: {
        type: DataTypes.BIGINT,
        autoIncrement: true,
        primaryKey: true
      },
      task: {
        type: DataTypes.STRING(50),
        allowNull: false
      },
      triggerTime: {
        type: DataTypes.DATE,
        allowNull: false
      },
      stage: {
        type: DataTypes.SMALLINT,
        allowNull: false
      },
      stageTime: {
        type: DataTypes.DATE,
        allowNull: false
      },
      stageMsg: {
        type: DataTypes.STRING(150)
      },
      taskResult: {
        type: DataTypes.SMALLINT
      },
      message: {
        type: DataTypes.STRING(150)
      },
      debugMsg: {
        type: DataTypes.STRING(1000)
      },
      crtTime: {
        type: DataTypes.DATE,
        allowNull: false
      },
      updTime: {
        type: DataTypes.DATE,
        allowNull: false
      }
    })
  }
};
