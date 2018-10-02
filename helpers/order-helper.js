const _ = require('lodash');
const moment = require('moment');
const Q = require('q');
const fileHelper = require('../helpers/file-helper');

module.exports.modelTargetOrderDataXslxGenerator = (orderDataSet, codeGroupMap, targetPath, password, callback) => {
  const header = [
    '訂單編號', '訂單領照人姓名', '訂單領照人身份證字號', '訂單領照人手機',
    '訂單訂約人姓名', '訂單訂約人身份證字號', '訂單訂約人手機', '訂單使用人姓名', '訂單使用人身份證字號', '訂單使用人手機',
    '車型', '受訂日', '經銷商', '營業所', '投放批次', '投放時間', '投放管道', '投放對象身分證', '投放對象手機',
    '回應時間', '回應管道'
  ];
  const sentListChannelMap = _.keyBy(codeGroupMap.sentListChannel, 'codeValue');
  const respListChannelMap = _.keyBy(codeGroupMap.RespListChannel, 'codeValue');
  // init xlsx data set
  const exportDateSet = [];
  exportDateSet.push(header); //header
  orderDataSet.forEach(row => {  //content
    let sentListLabel =
      sentListChannelMap[row.sentListChannel]? sentListChannelMap[row.sentListChannel].codeLabel: null;
    let respListLabel =
      respListChannelMap[row.respListChannel]? respListChannelMap[row.respListChannel].codeLabel: null;
    exportDateSet.push([
      row.CNTRNO, row.class_1_name, row.class_1_uid, row.class_1_mobile,
      row.class_2_name, row.class_2_uid, row.class_2_mobile,
      row.class_3_name, row.class_3_uid, row.class_3_mobile,
      row.CARMDL, moment(row.ORDDT).format('YYYY-MM-DD'), row.DLRCD, row.BRNHCD, row.batID,
      row.sentListTime? moment(row.sentListTime).format('YYYY-MM-DD'): null,
      sentListLabel, row.rptKey, row.uTel,
      row.respListTime? moment(row.respListTime).format('YYYY-MM-DD'): null, respListLabel
    ]);
  });

  Q.nfcall(fileHelper.buildXlsxFile, {
    sheetName: '成效報表',
    xlsxDataSet: exportDateSet,
    xlsxFileAbsolutePath: targetPath,
    password: password
  }).then(stat => {
    callback(null, stat);
  }).fail(err => {
    callback(err);
  });
};