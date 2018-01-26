'use strict';

// const winston = require('winston');

module.exports = {
  up: (query, DataTypes) => {
    return query.addColumn('cd_TransFeatSet', 'periodCriteriaFeatID', {
      type: DataTypes.STRING
    })
  }
};
