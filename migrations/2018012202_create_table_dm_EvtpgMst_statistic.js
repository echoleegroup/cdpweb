'use strict';

const Sequelize = require('sequelize');
const winston = require('winston');

module.exports = {
  up: (query, DataTypes) => {
    return query.createTable('dm_EvtpgMst_statistic', {
      evtpgID: {
        type: Sequelize.DataTypes.STRING(50),
        primaryKey: true,
        autoIncrement: false
      },
      browseCount: {
        type: Sequelize.DataTypes.INTEGER
      },
      cookieCount: {
        type: Sequelize.DataTypes.INTEGER
      },
      dxidCount: {
        type: Sequelize.DataTypes.INTEGER
      },
      canvasCount: {
        type: Sequelize.DataTypes.INTEGER
      }
    })
  }
};
