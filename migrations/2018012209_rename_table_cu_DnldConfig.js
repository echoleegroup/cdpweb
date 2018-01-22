'use strict';

// const winston = require('winston');

module.exports = {
  up: (query, DataTypes) => {
    return query.renameTable('cu_DnldConfig', 'cu_DnldFeat')
  }
};
