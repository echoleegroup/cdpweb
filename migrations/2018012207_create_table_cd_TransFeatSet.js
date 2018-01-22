'use strict';

// const winston = require('winston');

module.exports = {
  up: (query, DataTypes) => {
    return query.createTable('cd_TransFeatSet', {
      transSetID: {
        type: DataTypes.STRING(20),
        primaryKey: true,
        allowNull: false
      },
      transFeatSetID: {
        type: DataTypes.STRING(20),
        primaryKey: true,
        allowNull: false
      },
      transFeatSetName: {
        type: DataTypes.STRING(100)
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
