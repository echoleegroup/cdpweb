const winston = require('winston');

module.exports.featureSetsToTreeNodes = (setData) => {

  winston.info('===featureSetsToTreeNodes: %j', setData);
  return setData.map(set => {
    return {
      type: 'tail',
      id: set.transFeatSetID,
      label: set.transFeatSetName
    };
  });
};