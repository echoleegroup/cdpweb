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
        type: DataTypes.CHAR(3)
      },
      dataType: {
        type: DataTypes.CHAR(5)
      },
      dataSize: {
        type: DataTypes.INTEGER
      },
      chartType: {
        type: DataTypes.CHAR(3)
      },
      minPeriod: {
        type: DataTypes.CHAR(3)
      },
      dataSource: {
        type: DataTypes.CHAR(10)
      },
      isCode: {
        type: DataTypes.CHAR(1)
      },
      codeGroup: {
        type: DataTypes.CHAR(20)
      },
      featDesc: {
        type: DataTypes.STRING(200)
      },
      featRemark: {
        type: DataTypes.STRING(200)
      },
      featClient: {
        type: DataTypes.CHAR(20)
      },
      isDel: {
        type: DataTypes.CHAR(1)
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
      condiPickType: {
        type: DataTypes.STRING(20)
      }
    })
  }
};
