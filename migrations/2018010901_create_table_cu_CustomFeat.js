'use strict';

const Sequelize = require('sequelize');
const winston = require('winston');

module.exports = {
  up: (query, DataTypes) => {
    return query.createTable('cu_CustomFeat', {
      setID: {
        type: Sequelize.DataTypes.STRING(20),
        primaryKey: true,
        autoIncrement: false
      },
      featID: {
        type: Sequelize.DataTypes.STRING(50)
      },
      updTime: {
        type: Sequelize.DataTypes.DATE
      },
      updUser: {
        type: Sequelize.DataTypes.STRING(20)
      }
    })
  }
};
