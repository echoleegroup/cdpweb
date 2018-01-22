'use strict';

// const winston = require('winston');

module.exports = {
  up: (query, DataTypes) => {
    return query.createTable('cd_DnldFeat', {
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
      seqNO: {
        type: DataTypes.INTEGER
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
