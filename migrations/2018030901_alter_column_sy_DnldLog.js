'use strict';

// const winston = require('winston');

module.exports = {
  up: (query, DataTypes) => {
    return query.renameColumn('sy_DnldLog', 'logFilename', 'filePath').then(() => {
      return query.changeColumn('sy_DnldLog', 'filePath', {
        type: DataTypes.STRING(150),
        allowNull: false
      });
    });
  }
};
