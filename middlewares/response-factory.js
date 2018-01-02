'use strict'
const boom = require('boom');
const winston = require('winston');

module.exports.ajax_response_factory = (redirect) => {
  return (req, res, next) => {
    // winston.info('response-refactory');
    let resJson = res.json;
    res.json = function(data={}, code=200, message='') {
      // winston.info('response json factory');
      resJson.call(this, {
        code: code,
        data: data,
        message: message
      });
    };
    return next();
  };
};