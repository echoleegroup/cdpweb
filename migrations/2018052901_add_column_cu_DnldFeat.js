'use strict';

// const winston = require('winston');

module.exports = {
  up: (query, DataTypes) => {
    return query.addColumn('cu_DnldFeat', 'customized', {
      type: DataTypes.STRING(20)
    });
  }
};
