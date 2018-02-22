'use strict';

// const winston = require('winston');

module.exports = {
  up: (query, DataTypes, sequelize) => {
    return sequelize.query(`UPDATE sy_menu ` +
      `SET url = '/integration/query', menuCode = '_integratedQry'` +
      `WHERE menuCode = '_consumerAns'`).then(res => {
        return sequelize.query(`UPDATE sy_menu ` +
          `SET url = '/integration/export', menuCode = '_integratedExp'` +
          `WHERE menuCode = '_consumerSrch'`);
    });
  }
};
