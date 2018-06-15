'use strict';

// const winston = require('winston');

module.exports = {
  up: (query, DataTypes) => {
    return query.addColumn('cu_IntegratedQueryTask', 'expTime', {
      type: DataTypes.DATEONLY
    });
  }
};
