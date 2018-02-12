

'use strict';

// const winston = require('winston');

module.exports = {
  up: (query, DataTypes) => {
    return query.createTable('sy_ForgotPwd', {
      uuid: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
      },
      userId: {
        type: DataTypes.STRING(50),
        allowNull: false
      },
      email: {
        type: DataTypes.STRING(50),
        allowNull: false
      },
      is_expire: {
        type: DataTypes.STRING(5),
        allowNull: true
      },
      is_send: {
        type: DataTypes.STRING(5),
        allowNull: true
      },
      token: {
        type: DataTypes.STRING(200),
        allowNull: true
      },
      create_datetime: {
        type: DataTypes.DATE,
        allowNull: true
      },
      update_datetime: {
        type: DataTypes.DATE,
        allowNull: true
      }
    })
  }
};
