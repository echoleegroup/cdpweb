'use strict';

// const winston = require('winston');

module.exports = {
  up: (query, DataTypes) => {
    return query.createTable('cu_CustomFeat', {
      setID: {
        type: DataTypes.STRING(20),
        primaryKey: true,
        autoIncrement: false
      },
      featID: {
        type: DataTypes.STRING(50)
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
