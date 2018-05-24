'use strict';

// const winston = require('winston');

module.exports = {
  up: (query, DataTypes) => {
    return query.addColumn('sy_menu', 'homeFlag', {
      type: DataTypes.STRING(50)
    }).then(() => {
      return query.addColumn('sy_menu', 'icon', {
        type: DataTypes.STRING(50)
      });
    }).then(() => {
      return query.addColumn('sy_menu', 'homeCotnet', {
        type: DataTypes.STRING(200)
      });
    });
  }
};
