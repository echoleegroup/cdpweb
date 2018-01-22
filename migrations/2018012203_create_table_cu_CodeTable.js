'use strict';

// const winston = require('winston');

module.exports = {
  up: (query, DataTypes) => {
    return query.createTable('cu_CodeTable', {
      codeGroup: {
        type: DataTypes.STRING(20),
        primaryKey: true,
        allowNull: false
      },
      codeValue: {
        type: DataTypes.STRING(20),
        primaryKey: true,
        allowNull: false
      },
      codeLabel: {
        type: DataTypes.STRING(100)
      },
      codeSort: {
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
