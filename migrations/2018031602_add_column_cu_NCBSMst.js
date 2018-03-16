'use strict';

// const winston = require('winston');

module.exports = {
  up: (query, DataTypes) => {
    return query.addColumn('cu_NCBSMst', 'isTagged', {
      type: DataTypes.STRING(1)
    });
  }
};
