'use strict';

// const winston = require('winston');

module.exports = {
  up: (query, DataTypes) => {
    return query.addColumn('ft_Feature', 'uiInputType', {
      type: DataTypes.STRING(20)
    });
  }
};
