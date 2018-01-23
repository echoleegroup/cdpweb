'use strict';

// const winston = require('winston');

module.exports = {
  up: (query, DataTypes) => {
    return query.addColumn('ft_CodeTable', 'codeSort', {
      type: DataTypes.INTEGER
    })
  }
};
