'use strict';

// const winston = require('winston');

module.exports = {
  up: (query, DataTypes) => {
    return query.createTable('cu_LicsLatestSlod', {
      LICSNO: {
        type: DataTypes.STRING,
        primaryKey: true,
        allowNull: false
      },
      CNTRNO_ORDDT: {
        type: DataTypes.STRING,
        allowNull: false
      },
      CNTRNO: {
        type: DataTypes.STRING,
        allowNull: false
      },
      ORDDT: {
        type: DataTypes.DATE,
        allowNull: false
      },
      crtTime: {
        type: DataTypes.DATE,
        allowNull: false
      }
    })
  }
};
