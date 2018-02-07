'use strict';

// const winston = require('winston');

module.exports = {
  up: (query, DataTypes) => {
    return query.createTable('dm_TrackpgTag', {
      tagID: {
        type: DataTypes.BIGINT,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
      },
      trackpgID: {
        primaryKey: true,
        type: DataTypes.STRING(20)
      },
      tagLabel: {
        type: DataTypes.STRING(100)
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
