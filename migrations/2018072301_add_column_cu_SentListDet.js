'use strict';

// const winston = require('winston');

module.exports = {
  up: (query, DataTypes) => {
    return query.addColumn('cu_SentListDet', 'uTel', {
      type: DataTypes.STRING(30)
    });
  }
};
