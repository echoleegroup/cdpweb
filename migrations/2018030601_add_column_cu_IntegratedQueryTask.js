'use strict';

// const winston = require('winston');

module.exports = {
  up: (query, DataTypes) => {
    return query.addColumn('cu_IntegratedQueryTask', 'archiveSizeInBytes', {
      type: DataTypes.BIGINT.UNSIGNED.ZEROFILL
    }).then(() => {
      return query.addColumn('cu_IntegratedQueryTask', 'archiveEntries', {
        type: DataTypes.TINYINT.UNSIGNED.ZEROFILL
      });
    });
  }
};
