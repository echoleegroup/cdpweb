"use strict";

const path = require('path');
const ASSERTS = '.asserts';

module.exports = Object.freeze({
  LOG_FOLDER_PATH: '.logs',
  ASSERTS_FOLDER_PATH: ASSERTS,
  ASSERTS_ABSOLUTE_PATH: path.resolve(__dirname, '..', ASSERTS),
  FTP_FOLDER_PATH: path.join(ASSERTS, 'ftpd'),

  MENU_CODE: {
    USER: "_mgrUser",
    USER_ROLE: "_mgrRole",
    CUST_GENE: "_modelChar",
    CUST_MOTIVATION: "_modelPred",
    CUST_OBRV: "_modelBhv",
    EVENT_PAGE_LIST: "_actad_actList",
    EVENT_PAGE_EDIT: "_actad_actEdit",
    EVENT_AD: "_actad_ad",
    FEED_DATA_LIST: "_feedDataList",
    FEED_DATA_OUT: "_feedDataOutEdit",
    FEED_DATA_NCBS: "_feedDataNCBSEdit",
    GENE_RAUDIC: "_targetCal",
    MODEL_DOWNLOAD: "_targetDao",
    MODEL_LIST: "_modelOvv",
    TA_DISPATCH_UPLOAD: "_targetTaDispach",
    TA_REACTION_UPLOAD: "_targetTaReaction",
    TAANARPT_RULT: "_taanaRpt",
    EVENT_PAGE_Analysis:"actad_actAnalysis",
    CUSTOM_TARGET_FILTER: "_targetFilter"
  }
});

//# sourceMappingURL=config.js.map
