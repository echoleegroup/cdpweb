'use strict';

// const winston = require('winston');

module.exports = {
  up: (query, DataTypes) => {
    return query.renameColumn('cd_Feature', 'condiPickType', 'uiInputType');
  }
};
