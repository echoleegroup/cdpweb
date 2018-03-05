'use strict'

const express = require('express');
const winston = require('winston');
const Q = require('q');
const _ = require('lodash');
const shortid = require('shortid');
const factory = require("../../middlewares/response-factory");
const fileHelper = require('../../helpers/file-helper');
const integratedHelper = require('../../helpers/integrated-analysis-helper');
const constants = require('../../utils/constants');

module.exports = (app) => {
  winston.info('[api-model] Creating api-integration-analysis route.');
  const router = express.Router();

  router.get('/export/query/ready/:ip/:port/:queryId', factory.ajax_response_factory(), (req, res) => {
    const fs = require('fs');
    const path = require('path');
    const queryId = req.params.queryId;
    // const workingDirectory = shortid.generate();
    const sparkZipPath = path.join(constants.ASSERTS_SPARK_FEEDBACK_PATH_ABSOLUTE, `${queryId}.zip`);
    // const workingPath = path.resolve(constants.WORKING_DIRECTORY_PATH_ABSOLUTE, workingDirectory);
    const remoteDownloadUrl = `http://${req.params.ip}:${req.params.port}/download/${queryId}`;
    const remoteDeleteUrl = `http://${req.params.ip}:${req.params.port}/delete/${queryId}`;
    const finalZipPath = path.join(constants.ASSERTS_SPARK_INTEGRATED_ANALYSIS_ASSERTS_PATH_ABSOLUTE, `${queryId}.zip`);
    const mkdirp = require('mkdirp');
    const tempFolderName = shortid.generate();
    const workingPath = path.resolve(constants.WORKING_DIRECTORY_PATH_ABSOLUTE, tempFolderName);
    mkdirp(workingPath);

    // winston.info(`===download remote file: ${remoteDownloadUrl}`);

    Q.nfcall(fileHelper.downloadRemoteFile, remoteDownloadUrl, sparkZipPath).then(() => {
      res.json();
      //delete remote file
      // winston.info(`===delete remote file: ${remoteDeleteUrl}`);
      require('request-promise-native').post(remoteDeleteUrl);
      return Q.nfcall(integratedHelper.extractAndParseQueryResultFile, sparkZipPath, workingPath);
    }).fail(err => {
      res.json(null, 404, `${queryId}.zip not found`);
    }).then(csvFilePaths => {
      winston.info(`parsing to csv: ${csvFilePaths}`);
      return Q.nfcall(fileHelper.archiveFiles, csvFilePaths, finalZipPath);
    }).then(destZipPath => {
      winston.info(`archive finished: ${destZipPath}`);
      // const rmdir = require('rimraf');
      // rmdir(workingPath, err => {
      //   err && winston.warn(`remove ${workingPath} failed: ${err}`);
      // });
    }).fail(err => {
      winston.error(`parsing to csv and archive failed: ${err}`);
    });
  });

  return router;
};