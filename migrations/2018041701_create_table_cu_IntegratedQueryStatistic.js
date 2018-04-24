'use strict';

// const winston = require('winston');

module.exports = {
  up: (query, DataTypes) => {
    return query.createTable('cu_IntegratedQueryStatistic', {
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
      category: {
        type: DataTypes.STRING(20)
      },
      average: {
        type: DataTypes.FLOAT
      },
      median: {
        type: DataTypes.FLOAT
      },
      standardDeviation: {
        type: DataTypes.FLOAT
      },
      scaleUpperBound: {
        type: DataTypes.STRING(50),
      },
      scaleLowerBound: {
        type: DataTypes.STRING(50),
      },
      crtTime: {
        type: DataTypes.DATE
      }
    })
  }
};
