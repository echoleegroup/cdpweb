'use strict';

// const winston = require('winston');

module.exports = {
  up: (query, DataTypes) => {
    return query.createTable('cd_Feature', {
      featID: {
        type: DataTypes.STRING(50),
        primaryKey: true,
        allowNull: false
      },
      featName: {
        type: DataTypes.STRING(100)
      },
      featNameAbbr: {
        type: DataTypes.STRING(100)
      },
      featNameExt: {
        type: DataTypes.STRING(50)
      },
      featCateg: {
        type: DataTypes.STRING(3)
      },
      dataType: {
        type: DataTypes.STRING(20)
      },
      dataSize: {
        type: DataTypes.INTEGER
      },
      chartType: {
        type: DataTypes.STRING(20)
      },
      minPeriod: {
        type: DataTypes.STRING(10)
      },
      dataSource: {
        type: DataTypes.STRING(10)
      },
      isCode: {
        type: DataTypes.STRING(1)
      },
      codeGroup: {
        type: DataTypes.STRING(20)
      },
      featDesc: {
        type: DataTypes.STRING(200)
      },
      featRemark: {
        type: DataTypes.STRING(200)
      },
      featClient: {
        type: DataTypes.STRING(20)
      },
      isDel: {
        type: DataTypes.STRING(1)
      },
      crtTime: {
        type: DataTypes.DATE
      },
      updTime: {
        type: DataTypes.DATE
      },
      updUser: {
        type: DataTypes.STRING(20)
      },
      uiInputType: {
        type: DataTypes.STRING(20)
      }
    })
  }
};
