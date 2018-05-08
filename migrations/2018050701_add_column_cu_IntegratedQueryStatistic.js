'use strict';

// const winston = require('winston');

module.exports = {
  up: (query, DataTypes) => {
    return query.addColumn('cu_IntegratedQueryStatistic', 'maxScale', {
      type: DataTypes.STRING(50)
    }).then(() => {
      return query.addColumn('cu_IntegratedQueryStatistic', 'maxPeak', {
        type: DataTypes.STRING(50)
      });
    }).then(() => {
      return query.addColumn('cu_IntegratedQueryStatistic', 'maxProportion', {
        type: DataTypes.FLOAT
      });
    });
  }
};
