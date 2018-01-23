'user strict'

const Q = require('q');
const winston = require('winston');
const http = require('http');
const url = require('url');
const java_api_protocol = require("../app-config").get("JAVA_API_PROTOCOL");
const java_api_host = require("../app-config").get("JAVA_API_HOST");
const java_api_port = require("../app-config").get("JAVA_API_PORT");

module.exports.api = (path,req,res, callback = () => { }) => {
  let options = {
    protocol: java_api_protocol,
    host: java_api_host,
    port: java_api_port,
    path: path,
    method: 'GET',
    headers: {
      'Content-Type': 'application/json; charset=utf-8'
    }
  };
  http.request(options, function (res) {
    let msg = '';
    res.setEncoding('utf8');
    res.on('data', function (chunk) {
      msg += chunk;
    });
    res.on('end', function () {
      callback(null,JSON.parse(msg));
    });
  }).end();
};