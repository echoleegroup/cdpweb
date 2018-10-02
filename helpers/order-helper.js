const _ = require('lodash');
const boom = require('boom');
const moment = require('moment');
const path = require('path');
const Q = require('q');
const express = require('express');
const winston = require('winston');
// const appConfig = require("../app-config");
const middleware = require("../middlewares/login-check");
const constants = require("../utils/constants");
const permission = constants.MENU_CODE;
const _connector = require('../utils/sql-query-util');
const codeGroupHelper = require('../helpers/code-group-helper');
const fileHelper = require('../helpers/file-helper');
const modelService = require('../services/model-service');
const queryService = require('../services/query-log-service');
// const db = require("../utils/sql-server-connector").db;
// const java_api_endpoint = require("../app-config").get("JAVA_API_ENDPOINT");
const java_api_service = require('../services/java-api-service');
const orderService = require('../services/order-service');

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