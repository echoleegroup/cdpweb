"use strict";

const path = require('path');

exports.menucode = {
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
  TA_DISPATCH_UPLOAD: "__targetTaDispach",
  TA_REACTION_UPLOAD: "__targetTaReaction",
  TAANARPT_RULT: "_taanaRpt"
};

exports.ASSERTS_ABSOLUTE_PATH = path.resolve(__dirname, "../.asserts");

//# sourceMappingURL=config.js.map
