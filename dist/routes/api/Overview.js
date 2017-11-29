"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var API_Route_1 = require("../API_Route");
var inversify_1 = require("inversify");
require("reflect-metadata");
var di_types_1 = require("../di_types");
var common_enum_1 = require("../../bm/backend/common-enum");
var OverviewApiRoute = (function (_super) {
    __extends(OverviewApiRoute, _super);
    function OverviewApiRoute(overviewService) {
        var _this = _super.call(this) || this;
        _this._overviewService = overviewService;
        return _this;
    }
    OverviewApiRoute.prototype.init = function (router) {
        var _this = this;
        console.log('[IndexRoute::create] Creating Overview api route.');
        router.get('/china_mobile/overview/social_posting/count', function (req, res, next) {
            var brand = req.query.brand || '';
            if (brand === '') {
                res.statusCode = 500;
                _this.api_response(res, { data: '', api_code: '2.1', error_msg: 'Invalid mobile phone brand' });
            }
            else {
                var series = req.query.series || 'all';
                var g = parseInt(req.query.g, 10);
                var geneType = void 0;
                if (g === 1) {
                    geneType = common_enum_1.EnumGene.GeneData1;
                }
                else if (g === 2) {
                    geneType = common_enum_1.EnumGene.GeneData2;
                }
                else {
                    geneType = common_enum_1.EnumGene.All;
                }
                _this.getSocialPostingCount(res, brand, series, geneType);
            }
        });
    };
    OverviewApiRoute.prototype.getSocialPostingCount = function (res, brand, series, geneType) {
        var _this = this;
        this._overviewService.getSocialPostingCount(brand, series, geneType)
            .then(function (entity) {
            _this.api_response(res, { data: entity, api_code: '0', error_msg: '' });
        })
            .catch(function (err) {
            _this.api_response(res, { data: '', api_code: '2', error_msg: 'api error' });
        });
    };
    return OverviewApiRoute;
}(API_Route_1.BaseApiRoute));
OverviewApiRoute = __decorate([
    inversify_1.injectable(),
    __param(0, inversify_1.inject(di_types_1.TYPES.IOverviewService)),
    __metadata("design:paramtypes", [Object])
], OverviewApiRoute);
exports.OverviewApiRoute = OverviewApiRoute;

//# sourceMappingURL=Overview.js.map
