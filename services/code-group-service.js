const _ = require('lodash');
const Q = require('q');
const winston = require('winston');
const _connector = require('../utils/sql-query-util');

module.exports.getFeatureCodeGroups = (codeGroupList = [], callback) => {
  const sql = 'SELECT codeGroup, codeValue, codeLabel ' +
    'FROM CodeGroup_View ' +
    'WHERE codeGroup = @codeGroup ' +
    'ORDER BY codeSort';

  let prepared = _connector.preparedStatement(sql)
    .setType('codeGroup', _connector.TYPES.NVarChar);

  codeGroupList.reduce((accumulator, codeGroup) => {
    return accumulator.then(res => {
      return Q.nfcall(prepared.execute, {
        codeGroup: codeGroup
      }).then(codeGroupRes => (Object.assign(res, {  //return value expected to be {$codeGroupKey: [{code1}, {code2}, {code3}]}
        [codeGroup]: codeGroupRes
      })));
    });
  }, Q({})).then(codeGroupRes => {
    //codeGroupRes is expected to be
    // [{$codeGroupKey1: [{code1}, {code2}, {code3}]}, {$codeGroupKey2: [{code1}, {code2}, {code3}]}]
    winston.info('===getFeatureCodeGroups codeGroupRes:', codeGroupRes);
    callback(null, codeGroupRes);
  }).fail((err) => {
    winston.error('===getFeatureCodeGroups failed:', err);
    callback(err, null);
  }).finally(() => {
    prepared.release();
  });
};