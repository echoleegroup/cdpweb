const _ = require('lodash');
const moment = require('moment');
const _connector = require('../utils/sql-query-util');

module.exports.get_mdListScoreCustomizer = () => {
  return () => {
    return {
      select: ['detail.mdListScore AS mdListScore', 'detail.mdListScore AS _mdListScore'],
      join: [],
      where: [],
      parameters: []
    };
  }
};

module.exports.get_mdListSentCustomizer = (mdId) => {
  return () => {
    let mdIdParam = `mdId_${_.random(99, 99999)}`;
    return {
      select: ['CONVERT(NVARCHAR(10), sentList.sentListTime, 111) AS mdListSent'],
      join: [
        'LEFT JOIN cu_LicsnoIndex lic ON mdListKey1 = lic.LICSNO ' +
        'LEFT JOIN (' +
        ' SELECT rptKey, MAX(sm.sentListTime) AS sentListTime FROM cu_SentListDet sd' +
        '   LEFT JOIN cu_SentListMst sm ON sd.mdID = sm.mdID AND sd.batID = sm.batID AND sd.sentListID = sm.sentListID' +
        `   WHERE sm.mdID = @${mdIdParam} GROUP BY rptKey) AS sentList ON sentList.rptKey = lic.CustID_u`],
      where: [],
      parameters: [
        {
          name: mdIdParam,
          type: _connector.TYPES.NVarChar,
          value: mdId
        }
      ]
    };
  };
};

module.exports.get_mdListSlodCustomizer = () => {
  return () => {
    let orddtStart = `orddtStart_${_.random(99, 99999)}`;
    return {
      select: [
        'CASE ' +
          'WHEN lic_slod.LICSNO IS NOT NULL ' +
          `THEN CONCAT(lic_slod.CNTRNO, '(', CONVERT(NVARCHAR(10), lic_slod.ORDDT, 111), ')') ` +
          'ELSE NULL ' +
        'END AS mdListSlod'
      ],
      join: [
        `LEFT JOIN cu_LicsLatestSlod lic_slod ON lic_slod.LICSNO = lic.LICSNO AND lic_slod.ORDDT >= @${orddtStart}`
      ],
      where: [],
      parameters: [
        {
          name: orddtStart,
          type: _connector.TYPES.Date,
          value: moment().startOf('day').add(-1, 'year').toDate()
        }
      ]
    }
  };
};