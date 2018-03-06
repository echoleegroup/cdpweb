'use strict';

// const winston = require('winston');

module.exports = {
  up: (query, DataTypes) => {
    return query.createTable('dm_GenpgCategRule', {
      ruleID: {
        type: DataTypes.BIGINT,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
      },
      genCategID: {
        type: DataTypes.BIGINT
      },
      ruleType: {
        type: DataTypes.STRING(20)
      },
      rules: {
        type: DataTypes.STRING(1000)
      },
      isDel: {
        type: DataTypes.STRING(1)
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
