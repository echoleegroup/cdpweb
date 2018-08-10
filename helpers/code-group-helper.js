const _ = require('lodash');
const codeGroupService = require('../services/code-group-service');

module.exports.getCodeGroupMap = (codeGroup, callback) => {
  Q.nfcall(codeGroupService.getFeatureCodeGroup, codeGroup).then(codeData => {
    callback(null, _.keyBy(codeData, 'codeValue');
  });
};

module.exports.getCodeGroupsMap = (codeGroups, callback) => {
  Q.nfcall(codeGroupService.getFeatureCodeGroups, codeGroups).then(codeData => {
    callback(null, _.groupBy(codeData, 'codeGroup');
  });
};