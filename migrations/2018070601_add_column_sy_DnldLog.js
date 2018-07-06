'use strict';

// const winston = require('winston');

module.exports = {
  up: (query, DataTypes) => {
    return query.addColumn('sy_DnldLog', 'fileSize', {
      type: DataTypes.BIGINT
    });
  }
};
