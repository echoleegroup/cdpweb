'use strict';

// const winston = require('winston');

module.exports = {
  up: (query, DataTypes) => {
    return query.changeColumn('ft_Feature', 'featCateg', {
      type: DataTypes.STRING(3)
    }).then(res => {
      return query.changeColumn('ft_Feature', 'dataType', {
        type: DataTypes.STRING(20)
      })
    }).then(res => {
      return query.changeColumn('ft_Feature', 'chartType', {
        type: DataTypes.STRING(20)
      })
    }).then(res => {
      return query.changeColumn('ft_Feature', 'dataSource', {
        type: DataTypes.STRING(10)
      })
    }).then(res => {
      return query.changeColumn('ft_Feature', 'isCode', {
        type: DataTypes.STRING(1)
      })
    }).then(res => {
      return query.changeColumn('ft_Feature', 'codeGroup', {
        type: DataTypes.STRING(20)
      })
    }).then(res => {
      return query.changeColumn('ft_Feature', 'featClient', {
        type: DataTypes.STRING(20)
      })
    }).then(res => {
      return query.changeColumn('ft_Feature', 'isDel', {
        type: DataTypes.STRING(1)
      })
    });
  }
};
