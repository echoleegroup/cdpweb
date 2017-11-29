"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var API_Route_1 = require("../API_Route");
var IndexApiRoute = (function (_super) {
    __extends(IndexApiRoute, _super);
    function IndexApiRoute() {
        return _super.call(this) || this;
    }
    IndexApiRoute.create = function (router) {
        console.log('[IndexRoute::create] Creating index api route.');
        router.get('/', function (req, res, next) {
            new IndexApiRoute().process(req, res, next);
        });
    };
    IndexApiRoute.prototype.process = function (req, res, next) {
        var result = {
            data: 'Api route testing',
            api_code: '0',
            error_msg: ''
        };
        this.api_response(res, result);
    };
    return IndexApiRoute;
}(API_Route_1.BaseApiRoute));
exports.IndexApiRoute = IndexApiRoute;

//# sourceMappingURL=index.js.map
