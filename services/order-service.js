'use strict'

const Q = require('q');
const winston = require('winston');
const _connector = require('../utils/sql-query-util');

module.exports.getOrderDetailOfModelTarget = (mdID, callback) => {
  const sql = 'WITH sentList AS ( ' +
    '  SELECT *, DATEADD(YEAR, 1, sentListTime) AS sentListTimeAfterOneYear ' +
    '  FROM cu_SentListView ' +
    '  WHERE mdID = @mdID ' +
    '), ' +
    'slod AS ( ' +
    '  SELECT * ' +
    '  FROM cu_Slod ' +
    `  WHERE CNTSTS = '1' AND MOVSTS NOT IN ('6', '7') AND substring(CNTRNO, 2, 1) <> '5' ` +
    ') ' +
    'SELECT slod.*, ' +
    '       type1.CUSTNM AS class_1_name, type1.CUSTID AS class_1_uid, type1.MOBILE AS class_1_mobile, ' +
    '       type2.CUSTNM AS class_2_name, type2.CUSTID AS class_2_uid, type2.MOBILE AS class_2_mobile, ' +
    '       type3.CUSTNM AS class_3_name, type3.CUSTID AS class_3_uid, type3.MOBILE AS class_3_mobile ' +
    'FROM ( ' +
    '  SELECT * ' +
    '  FROM ( ' +
    '    SELECT all_sent.*, all_resp.respListTime, all_resp.respListID, all_resp.respListChannel, ' +
    '           ROW_NUMBER() OVER ( ' +
    '               PARTITION BY all_sent.CNTRNO, all_sent.batID, all_sent.rptKey, all_sent.uTel ' +
    '               ORDER BY all_sent.sentListTime DESC, all_resp.respListTime DESC) AS SEQ ' +
    '    FROM ( ' +
    '      SELECT slod.CNTRNO, sent.batID, sent.rptKey, sent.uTel, ' +
    '             sent.sentListID, sent.sentListTime, sent.sentListChannel, ' +
    '             slod.CARMDL, slod.ORDDT, slod.DLRCD, slod.BRNHCD ' +
    '      FROM slod ' +
    '      INNER JOIN sentList sent ON slod.CUSTID = sent.rptKey ' +
    '      AND slod.ORDDT >= sentListTime ' +
    '      AND slod.ORDDT <= sentListTimeAfterOneYear ' +
    '' +
    '      UNION ' +
    '' +
    '      SELECT slod.CNTRNO, sent.batID, sent.rptKey, sent.uTel, ' +
    '             sent.sentListID, sent.sentListTime, sent.sentListChannel, ' +
    '             slod.CARMDL, slod.ORDDT, slod.DLRCD, slod.BRNHCD ' +
    '      FROM slod ' +
    '      INNER JOIN sentList sent ON slod.MOBILE = sent.uTel ' +
    '      AND slod.ORDDT >= sentListTime ' +
    '      AND slod.ORDDT <= sentListTimeAfterOneYear ' +
    '    ) AS all_sent ' +
    '    LEFT JOIN ( ' +
    '      SELECT respMst.batID, respMst.respListTime, respMst.respListID, respMst.respListChannel ' +
    '      FROM cu_RespListMst respMst ' +
    '      INNER JOIN cu_RespListDet respDet ON respMst.mdID = @mdID AND respMst.respListID = respDet.respListID ' +
    '    ) AS all_resp ON all_sent.batID = all_resp.batID ' +
    '  ) AS seq_sent ' +
    '  WHERE SEQ = 1 ' +
    ') AS slod ' +
    `LEFT JOIN cu_Slod type1 ON type1.CUSTCLASS = '1' AND type1.CNTRNO = slod.CNTRNO ` +
    `LEFT JOIN cu_Slod type2 ON type2.CUSTCLASS = '2' AND type2.CNTRNO = slod.CNTRNO ` +
    `LEFT JOIN cu_Slod type3 ON type3.CUSTCLASS = '3' AND type3.CNTRNO = slod.CNTRNO `;

  const request = _connector.queryRequest()
    .setInput('mdID', _connector.TYPES.NVarChar, mdID);

  Q.nfcall(request.executeQuery, sql).then(resData => {
    callback(null, resData);
  }).fail(err => {
    callback(err);
  });
};

module.exports.getOrderDetailOfModelBatchTarget = (mdID, batID, callback) => {
  const sql = 'WITH sentList AS ( ' +
    '  SELECT *, DATEADD(YEAR, 1, sentListTime) AS sentListTimeAfterOneYear ' +
    '  FROM cu_SentListView ' +
    '  WHERE mdID = @mdID AND batID = @batID ' +
    '), ' +
    'slod AS ( ' +
    '  SELECT * ' +
    '  FROM cu_Slod ' +
    `  WHERE CNTSTS = '1' AND MOVSTS NOT IN ('6', '7') AND substring(CNTRNO, 2, 1) <> '5' ` +
    ') ' +
    'SELECT slod.*, ' +
    '       type1.CUSTNM AS class_1_name, type1.CUSTID AS class_1_uid, type1.MOBILE AS class_1_mobile, ' +
    '       type2.CUSTNM AS class_2_name, type2.CUSTID AS class_2_uid, type2.MOBILE AS class_2_mobile, ' +
    '       type3.CUSTNM AS class_3_name, type3.CUSTID AS class_3_uid, type3.MOBILE AS class_3_mobile ' +
    'FROM ( ' +
    '  SELECT * ' +
    '  FROM ( ' +
    '    SELECT all_sent.*, all_resp.respListTime, all_resp.respListID, all_resp.respListChannel, ' +
    '           ROW_NUMBER() OVER ( ' +
    '               PARTITION BY all_sent.CNTRNO, all_sent.batID, all_sent.rptKey, all_sent.uTel ' +
    '               ORDER BY all_sent.sentListTime DESC, all_resp.respListTime DESC) AS SEQ ' +
    '    FROM ( ' +
    '      SELECT slod.CNTRNO, sent.batID, sent.rptKey, sent.uTel, ' +
    '             sent.sentListID, sent.sentListTime, sent.sentListChannel, ' +
    '             slod.CARMDL, slod.ORDDT, slod.DLRCD, slod.BRNHCD ' +
    '      FROM slod ' +
    '      INNER JOIN sentList sent ON slod.CUSTID = sent.rptKey ' +
    '      AND slod.ORDDT >= sentListTime ' +
    '      AND slod.ORDDT <= sentListTimeAfterOneYear ' +
    '' +
    '      UNION ' +
    '' +
    '      SELECT slod.CNTRNO, sent.batID, sent.rptKey, sent.uTel, ' +
    '             sent.sentListID, sent.sentListTime, sent.sentListChannel, ' +
    '             slod.CARMDL, slod.ORDDT, slod.DLRCD, slod.BRNHCD ' +
    '      FROM slod ' +
    '      INNER JOIN sentList sent ON slod.MOBILE = sent.uTel ' +
    '      AND slod.ORDDT >= sentListTime ' +
    '      AND slod.ORDDT <= sentListTimeAfterOneYear ' +
    '    ) AS all_sent ' +
    '    LEFT JOIN ( ' +
    '      SELECT respMst.batID, respMst.respListTime, respMst.respListID, respMst.respListChannel ' +
    '      FROM cu_RespListMst respMst ' +
    '      INNER JOIN cu_RespListDet respDet ON respMst.mdID = @mdID AND batID = @batID ' +
    '      AND respMst.respListID = respDet.respListID ' +
    '    ) AS all_resp ON all_sent.batID = all_resp.batID ' +
    '  ) AS seq_sent ' +
    '  WHERE SEQ = 1 ' +
    ') AS slod ' +
    `LEFT JOIN cu_Slod type1 ON type1.CUSTCLASS = '1' AND type1.CNTRNO = slod.CNTRNO ` +
    `LEFT JOIN cu_Slod type2 ON type2.CUSTCLASS = '2' AND type2.CNTRNO = slod.CNTRNO ` +
    `LEFT JOIN cu_Slod type3 ON type3.CUSTCLASS = '3' AND type3.CNTRNO = slod.CNTRNO `;

  const request = _connector.queryRequest()
    .setInput('mdID', _connector.TYPES.NVarChar, mdID)
    .setInput('batID', _connector.TYPES.NVarChar, batID);

  Q.nfcall(request.executeQuery, sql).then(resData => {
    callback(null, resData);
  }).fail(err => {
    callback(err);
  });
};