"use strict";
var Knex = require("knex");
var Bookshelf = require("bookshelf");
var Config = require("../../configuration//config");
var config = Config.getConfig(process.env.NODE_ENV);
var _a = [config.db.db_client, config.db.db_info], client = _a[0], connection = _a[1];
var knex = Knex({
    client: client,
    connection: connection
});
exports.bookshelf = Bookshelf(knex);

//# sourceMappingURL=bookshelf.js.map
