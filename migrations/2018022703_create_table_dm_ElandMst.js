'use strict';

// const winston = require('winston');

module.exports = {
  up: (query, DataTypes) => {
    return query.createTable('dm_ElandMst', {
      elandCategID: {
        type: DataTypes.STRING(20),
        primaryKey: true,
        allowNull: false
      },
      client: {
        type: DataTypes.STRING(20)
      },
      categName: {
        type: DataTypes.STRING(50)
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
        type: DataTypes.STRING(20)
      }
    })
  }
};
