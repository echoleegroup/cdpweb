'use strict';

// const winston = require('winston');

module.exports = {
  up: (query, DataTypes) => {
    return query.createTable('cd_CategTree', {
      treeID: {
        type: DataTypes.STRING(50),
        primaryKey: true,
        allowNull: false
      },
      nodeID: {
        type: DataTypes.STRING(50),
        primaryKey: true,
        allowNull: false
      },
      parentID: {
        type: DataTypes.STRING(50)
      },
      treeLevel: {
        type: DataTypes.INTEGER
      },
      treeSeq: {
        type: DataTypes.INTEGER
      },
      isDummy: {
        type: DataTypes.CHAR(1)
      },
      nodeName: {
        type: DataTypes.STRING(100)
      },
      nodeRef: {
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
