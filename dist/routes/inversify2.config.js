"use strict";
var inversify_1 = require("inversify");
var di_types_1 = require("./di_types");
var ChinaMobile_1 = require("./api/ChinaMobile");
var Overview_1 = require("../bl/backend/Overview");
var OverviewRepository_1 = require("../data_store/rdb/china_mobile/repository/overview/OverviewRepository");
var myContainer = new inversify_1.Container();
exports.myContainer = myContainer;
myContainer.bind(di_types_1.TYPES.IChinaMobileAPI).to(ChinaMobile_1.ChinaMobileAPI);
myContainer.bind(di_types_1.TYPES.IOverviewService).to(Overview_1.OverviewService);
myContainer.bind(di_types_1.TYPES.IOverviewRepository).to(OverviewRepository_1.OverviewRepository);

//# sourceMappingURL=inversify.config.js.map
