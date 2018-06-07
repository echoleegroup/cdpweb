'use strict';

// const winston = require('winston');

module.exports = {
  up: (query, DataTypes, sequelize) => {
    return sequelize.query(
      'CREATE FUNCTION ufn_getLatestSlod(@LICSNO NVARCHAR(20), @startDate DATE, @endDate DATE)\n' +
      '\n' +
      'RETURNS NVARCHAR(10)\n' +
      '\n' +
      'BEGIN\n' +
      '    DECLARE @CATRNO_ORDDT NVARCHAR(100);\n' +
      '    SET @CATRNO_ORDDT = (\n' +
      `        SELECT TOP 1 CNTRNO + '(' + CONVERT(NVARCHAR(10), ORDDT, 111) + ')'` + '\n' +
      '        FROM (\n' +
      '            SELECT *\n' +
      '            FROM cu_Slod\n' +
      `            WHERE CNTSTS = '1' AND` + '\n' +
      `                  MOVSTS NOT IN ('6','7') AND ` + '\n' +
      '                  ORDDT > @startDate AND \n' +
      '                  ORDDT <= @endDate\n' +
      '        ) slod\n' +
      '        INNER JOIN (SELECT * FROM cu_LicsnoIndex WHERE LICSNO = @LICSNO) lics\n' +
      '        ON slod.CUSTID = lics.CustID_u OR\n' +
      '           slod.CUSTID = lics.CustID_l OR\n' +
      '           slod.MOBILE = lics.Mobile_u OR\n' +
      '           slod.MOBILE = lics.Mobile_l\n' +
      '        ORDER BY slod.ORDDT DESC, slod.CNTRNO DESC\n' +
      '    );\n' +
      '    RETURN (@CATRNO_ORDDT);\n' +
      'END'
    );
  }
};
