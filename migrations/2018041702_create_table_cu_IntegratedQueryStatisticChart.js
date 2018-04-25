'use strict';

// const winston = require('winston');

module.exports = {
  up: (query, DataTypes) => {
    return query.createTable('cu_IntegratedQueryStatisticChart', {
      queryID: {
        type: DataTypes.STRING(20),
        primaryKey: true,
        allowNull: false
      },
      featID: {
        type: DataTypes.STRING(50),
        primaryKey: true,
        allowNull: false
      },
      scale: {
        type: DataTypes.STRING(50),
        primaryKey: true,
        allowNull: false
      },
      peak: {
        type: DataTypes.STRING(50)
      },
      proportion: {
        type: DataTypes.FLOAT
      },
      seq: {
        type: DataTypes.INTEGER
      },
      crtTime: {
        type: DataTypes.DATE
      }
    })
  }
};
