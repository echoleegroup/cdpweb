'use strict';
const winston = require('winston');
const API_360_HOST = require("../app-config").get("API_360_HOST");
const API_360_PORT = require("../app-config").get("API_360_PORT");
module.exports.transService = (queryId, JObject, callback) => {
  //呼叫API
  
  let request = require('request');
  let url = "http://" + API_360_HOST + ":" + API_360_PORT + "/query_nonowner/" + queryId;
  request({
    url: url,
    method: "POST",
    json: true,
    body: JObject
  }, function (error, response, body) {
    if (error)
      callback(error, null);
    else
      callback(null, JObject);
  });




};
