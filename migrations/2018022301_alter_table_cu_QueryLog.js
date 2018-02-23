'use strict';

// const winston = require('winston');

module.exports = {
  up: (query, DataTypes) => {
    // return query
    //   .renameColumn('cu_QueryLog', 'requestTime', 'crtTime')
    //   .removeColumn('cu_QueryLog', 'queryTime')
    //   .addColumn('cu_QueryLog', 'updTime', {
    //     type: DataTypes.DATE
    //   }).addColumn('cu_QueryLog', 'updUser', {
    //     type: DataTypes.STRING(150)
    //   });
    return Promise.all([
      query.renameColumn('cu_QueryLog', 'requestTime', 'crtTime'),
      query.removeColumn('cu_QueryLog', 'queryTime'),
      query.addColumn('cu_QueryLog', 'updTime', {
        type: DataTypes.DATE
      }),
      query.addColumn('cu_QueryLog', 'updUser', {
        type: DataTypes.STRING(150)
      })
    ]);
  }
};
