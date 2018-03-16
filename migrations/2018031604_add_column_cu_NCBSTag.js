'use strict';

// const winston = require('winston');

module.exports = {
  up: (query, DataTypes) => {
    return query.addColumn('cu_NCBSTag', 'ncbsQus', {
      type: DataTypes.STRING(20),
    });
  }
};
