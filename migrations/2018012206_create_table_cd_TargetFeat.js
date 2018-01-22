'use strict';

// const winston = require('winston');

module.exports = {
  up: (query, DataTypes) => {
    return query.createTable('cd_TargetFeat', {
      setID: {
        type: DataTypes.STRING(20),
        primaryKey: true,
        allowNull: false
      },
      featID: {
        type: DataTypes.STRING(50),
        primaryKey: true,
        allowNull: false
      },
      updTime: {
        type: DataTypes.DATE
      },
      updUser: {
        type: DataTypes.STRING(20)
      }
    })
  }
};
