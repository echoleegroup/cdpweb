const Q = require('q');
const winston = require('winston');
const _connector = require('../utils/sql-query-util');

module.exports.getFeatureCodeGroups = (codeGroupList = [], callback) => {
  const sql = 'SELECT codeGroup, codeValue, codeLabel ' +
    'FROM ft_CodeGroup_View ' +
    'WHERE codeGroup = @codeGroup';

  let prepared = _connector.preparedStatement()
    .setType('codeGroup', _connector.TYPES.NVarChar);

  let promises = codeGroupList.map((codeGroup) => {
    return Q.nfcall(prepared.execute, sql, {
      codeGroup: codeGroup
    }).then(codeGroupRes => ({  //return value expected to be {$codeGroupKey: [{code1}, {code2}, {code3}]}
      [codeGroup]: codeGroupRes
    }));
  });

  Q.all(promises).then(codeGroupRes => {
    //codeGroupRes is expected to be
    // [{$codeGroupKey1: [{code1}, {code2}, {code3}]}, {$codeGroupKey2: [{code1}, {code2}, {code3}]}]
    callback(null, Object.assign({}, ...codeGroupRes));
  }).fail((err) => {
    winston.error('===getFeatureCodeGroups failed:', err);
    callback(err, null);
  });
};