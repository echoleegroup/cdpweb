const _ = require('lodash');
const Q = require('q');
const codeGroupService = require('../services/code-group-service');

module.exports.getFeatureCodeGroupMap = (codeGroup, callback) => {
  Q.nfcall(codeGroupService.getFeatureCodeGroup, codeGroup).then(codeData => {
    callback(null, _.keyBy(codeData, 'codeValue'));
  });
};

module.exports.getFeatureCodeGroupsMap = (codeGroups, callback) => {
  Q.nfcall(codeGroupService.getFeatureCodeGroups, codeGroups).then(codeData => {
    callback(null, _.groupBy(codeData, 'codeGroup'));
  });
};

module.exports.getPortalSyCodeGroupMap = (codeGroup, callback) => {
  Q.nfcall(codeGroupService.getFeatureCodeGroup, codeGroup).then(codeData => {
    callback(null, _.keyBy(codeData, 'codeValue'));
  });
};

module.exports.getPortalSyCodeGroupsMap = (codeGroups, callback) => {
  Q.nfcall(codeGroupService.getFeatureCodeGroups, codeGroups).then(codeData => {
    callback(null, _.groupBy(codeData, 'codeGroup'));
  });
};