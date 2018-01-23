'use strict';

// const winston = require('winston');

module.exports = {
  up: (query, DataTypes, sequelize) => {
    return sequelize.query('CREATE VIEW "CodeGroup_View" AS ' +
      'SELECT codeGroup, codeValue, codeLabel, codeSort, updTime, updUser FROM cu_CodeTable ' +
      'UNION ' +
      'SELECT codeGroup, codeValue, codeLabel, codeSort, updTime, updUser FROM ft_CodeTable');
  }
};
