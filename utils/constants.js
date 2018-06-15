"use strict";

const path = require('path');
const mkdirp = require('mkdirp');
const ASSERTS_FOLDER = '.asserts';
const ASSERTS_FOLDER_PATH_ABSOLUTE = path.resolve(__dirname, '..', ASSERTS_FOLDER);
const ASSERTS_FTP_FOLDER_PATH = path.join(ASSERTS_FOLDER, 'ftpd');
const ASSERTS_SPARK_FEEDBACK_PATH_ABSOLUTE = process.env.PATH_TO_SPARK_FEEDBACK || path.join(ASSERTS_FOLDER_PATH_ABSOLUTE, 'spark_feedback');
const ASSERTS_SPARK_INTEGRATED_ANALYSIS_ASSERTS_PATH_ABSOLUTE = process.env.PATH_TO_INTEGRATED_ASSERTS || path.join(ASSERTS_FOLDER_PATH_ABSOLUTE, 'integrated_analysis');
const ASSERTS_CUSTOM_TARGET_ASSERTS_PATH_ABSOLUTE = process.env.PATH_TO_CUSTOM_TARGET_ASSERTS || path.join(ASSERTS_FOLDER_PATH_ABSOLUTE, 'custom_target');
const WORKING_DIRECTORY_PATH_ABSOLUTE = process.env.PATH_TO_TEMPORARILY_WORKING_DIRECTORY || path.join(ASSERTS_FOLDER_PATH_ABSOLUTE, 'temp');

mkdirp(ASSERTS_SPARK_FEEDBACK_PATH_ABSOLUTE);
mkdirp(ASSERTS_SPARK_INTEGRATED_ANALYSIS_ASSERTS_PATH_ABSOLUTE);
mkdirp(ASSERTS_CUSTOM_TARGET_ASSERTS_PATH_ABSOLUTE);
mkdirp(WORKING_DIRECTORY_PATH_ABSOLUTE);

module.exports = Object.freeze({
  LOG_FOLDER_PATH: '.logs',
  ASSERTS_FOLDER_PATH: ASSERTS_FOLDER,
  ASSERTS_FOLDER_PATH_ABSOLUTE: ASSERTS_FOLDER_PATH_ABSOLUTE,
  ASSERTS_FTP_FOLDER_PATH: ASSERTS_FTP_FOLDER_PATH,
  ASSERTS_SPARK_FEEDBACK_PATH_ABSOLUTE: ASSERTS_SPARK_FEEDBACK_PATH_ABSOLUTE,
  ASSERTS_SPARK_INTEGRATED_ANALYSIS_ASSERTS_PATH_ABSOLUTE: ASSERTS_SPARK_INTEGRATED_ANALYSIS_ASSERTS_PATH_ABSOLUTE,
  ASSERTS_CUSTOM_TARGET_ASSERTS_PATH_ABSOLUTE: ASSERTS_CUSTOM_TARGET_ASSERTS_PATH_ABSOLUTE,
  WORKING_DIRECTORY_PATH_ABSOLUTE: WORKING_DIRECTORY_PATH_ABSOLUTE,

  CLIENT_CRITERIA_FEATURE_SET_ID: 'COMMCUST',
  VEHICLE_CRITERIA_FEATURE_SET_ID: 'COMMCAR',
  INTEGRATION_ANALYSIS_TREE_ID: 'COMM',
  CRITERIA_TRANSACTION_SET_ID: 'COMMTARGETSET',
  EXPORT_DOWNLOAD_FEATURE_SET_ID: 'COMMDNLD',
  EXPORT_RELATIVE_SET_ID: 'COMMDNLDSET',

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
    CUSTOM_TARGET_FILTER: "_targetFilter",
    INTEGRATED_QUERY: "_integratedQry",
    INTEGRATED_EXPORT: "_integratedExp",
    ANONYMOUS_QUERY: "_anonymousQry"
  },

  INTEGRATED_MODE: {
    IDENTIFIED: 'identified',
    ANONYMOUS: 'anonymous'
  }
});

//# sourceMappingURL=config.js.map
