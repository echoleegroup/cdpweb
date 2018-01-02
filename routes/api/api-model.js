'use strict';

const express = require('express');
const winston = require('winston');
const auth = require("../../middlewares/login-check");
const factory = require("../../middlewares/response-factory");

module.exports = (app) => {
  winston.info('[api-model] Creating api-model route.');
  const router = express.Router();

  router.get('/', [
    factory.ajax_response_factory(),
    auth.ajaxCheck()], (req, res) => {
    res.json();
  });

  return router;
};