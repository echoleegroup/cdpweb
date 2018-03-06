'use strict';

// const winston = require('winston');

module.exports = {
  up: (query, DataTypes) => {
    return query.createTable('dm_ElandTag', {
      tagID: {
        type: DataTypes.STRING(20),
        primaryKey: true,
        allowNull: false
      },
      elandCategID: {
        type: DataTypes.STRING(20),
        primaryKey: true,
        allowNull: false
      },
      tagLabel: {
        type: DataTypes.STRING(10)
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
