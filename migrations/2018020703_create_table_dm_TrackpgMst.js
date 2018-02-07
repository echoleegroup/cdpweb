'use strict';

// const winston = require('winston');

module.exports = {
  up: (query, DataTypes) => {
    return query.createTable('dm_TrackpgMst', {
      trackpgID: {
        type: DataTypes.STRING(20),
        primaryKey: true,
        allowNull: false
      },
      client: {
        type: DataTypes.STRING(20)
      },
      trackpgCateg: {
        type: DataTypes.STRING(20)
      },
      trackpgName: {
        type: DataTypes.STRING(150)
      },
      trackpgTitle: {
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
