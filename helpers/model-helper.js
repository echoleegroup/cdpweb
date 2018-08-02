const _ = require('lodash');
const _connector = require('../utils/sql-query-util');

module.exports.thresholdRestrictionCustomizer = (lowerBound, upperBound) => {
  return () => {
    return {
      select: undefined,
      join: undefined,
      where: ['detail.mdListScore >= @lowerBound', 'detail.mdListScore <= @upperBound'],
      parameters: [{
        name: 'lowerBound',
        type: _connector.TYPES.Float,
        value: lowerBound
      }, {
        name: 'upperBound',
        type: _connector.TYPES.Float,
        value: upperBound
      }]
    };
  };
};

module.exports.recordRestrictionCustomizer = (records) => {
  return () => {
    return {
      reduction: [`TOP ${records}`]
    };
  };
};