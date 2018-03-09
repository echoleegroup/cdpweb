'use strict';

// const winston = require('winston');

module.exports = {
  up: (query, DataTypes) => {
    return query.addColumn('cu_IntegratedQueryTask', 'archiveSizeInBytes', {
      type: DataTypes.BIGINT
    }).then(() => {
      return query.addColumn('cu_IntegratedQueryTask', 'archiveEntries', {
        type: DataTypes.TEXT
      });
    });
  }
};
