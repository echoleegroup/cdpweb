const express = require('express');
const fs = require('fs');
const winston = require('winston');
const factory = require("../middlewares/response-factory");

module.exports = (app) => {
  winston.info('[api-model] Creating api-test route.');
  const router = express.Router();

  router.get('/download/:queryId', factory.ajax_response_factory(), (req, res) => {
    winston.info(`===[TEST] /download/${req.params.queryId}`);
    fs.createReadStream('/Users/hd/Documents/project/cdp/Archive.zip').pipe(res);
  });

  router.post('/delete/:queryId', factory.ajax_response_factory(), (req, res) => {
    winston.info(`===[TEST] /delete/${req.params.queryId}`);
    res.json();
  });

  return router;
};