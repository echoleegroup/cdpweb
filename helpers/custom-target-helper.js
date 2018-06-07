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
    return {
      select: ['od.mdListSlod AS mdListSlod'],
      join: [
        'LEFT JOIN ( ' +
          'SELECT lic.LICSNO, MAX(so.mdListSlod) AS mdListSlod ' +
          'FROM cu_LicsnoIndex lic ' +
          'INNER JOIN ( ' +
            `SELECT CNTRNO + '(' + CONVERT(NVARCHAR(10), ORDDT, 111) + ')' AS mdListSlod, CUSTID, MOBILE ` +
            'FROM cu_Slod ' +
            `WHERE CNTSTS = '1' AND MOVSTS NOT IN ('6','7') AND ORDDT > @ORDDT ` +
          ') so ON lic.CustID_u = so.CUSTID OR lic.CustID_l = so.CUSTID OR lic.Mobile_u = so.MOBILE OR lic.Mobile_l = so.MOBILE ' +
          'GROUP BY lic.LICSNO ' +
        ') od ON od.LICSNO = lic.LICSNO'
      ],
      where: [],
      parameters: [
        {
          name: 'ORDDT',
          type: _connector.TYPES.Date,
          value: moment().startOf('day').add(-1, 'year').toDate()
        }
      ]
    }
  };
};