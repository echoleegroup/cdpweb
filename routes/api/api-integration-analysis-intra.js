'use strict'

const express = require('express');
const winston = require('winston');
const Q = require('q');
const _ = require('lodash');
const shortid = require('shortid');
const factory = require("../../middlewares/response-factory");
const fileHelper = require('../../helpers/file-helper');
const integratedHelper = require('../../helpers/integrated-analysis-helper');
const queryLogService = require('../../services/query-log-service');
const integrationTaskService = require('../../services/integration-analysis-task-service');
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
    const remoteDownloadUrl = `http://${req.params.ip}:${req.params.port}/api/intra/test/download/${queryId}`;
    const remoteDeleteUrl = `http://${req.params.ip}:${req.params.port}/api/intra/test/delete/${queryId}`;
    const finalZipPath = path.join(constants.ASSERTS_SPARK_INTEGRATED_ANALYSIS_ASSERTS_PATH_ABSOLUTE, `${queryId}.zip`);
    const mkdirp = require('mkdirp');
    const tempFolderName = shortid.generate();
    const workingPath = path.resolve(constants.WORKING_DIRECTORY_PATH_ABSOLUTE, tempFolderName);
    mkdirp(workingPath);
    let featureIdMap = {};

    // winston.info(`===download remote file: ${remoteDownloadUrl}`);

    Q.nfcall(queryLogService.getQueryLogProcessingData, queryId).then(queryLogData => {
      if (!queryLogData) {
        res.json(null, 401, `task ${queryId} not found`);
      } else {
        // winston.info('queryLogData: ', queryLogData);
        featureIdMap = JSON.parse(queryLogData.reserve1).export;
        // winston.info('query log process Data: %j', featureIdMap);
        return Q.nfcall(fileHelper.downloadRemoteFile, remoteDownloadUrl, sparkZipPath);
      }
    }).fail(err => {
      Q.nfcall(integrationTaskService.setQueryTaskStatusRemoteFileNotFound, queryId);
      res.json(null, 404, `${queryId}.zip not found`);
    }).then(() => {
      res.json();
      //delete remote file
      // winston.info(`===delete remote file: ${remoteDeleteUrl}`);
      require('request-promise-native').post(remoteDeleteUrl);
      Q.nfcall(integrationTaskService.setQueryTaskStatusParsing, queryId).fail(err => {
        winston.error(err);
      });
      return Q.nfcall(integratedHelper.extractAndParseQueryResultFile, sparkZipPath, workingPath, featureIdMap);
    }).then(csvFilePaths => {
      winston.info(`parsing to csv: ${csvFilePaths}`);
      return Q.nfcall(fileHelper.archiveFiles, csvFilePaths, finalZipPath);
    }).then(destZipPath => {
      winston.info(`archive finished: ${destZipPath}`);
      return Q.nfcall(fileHelper.archiveStat, destZipPath);
    }).then(stat => {
      winston.info('archive stat: %j', stat);
      return Q.nfcall(integrationTaskService.setQueryTaskStatusComplete, queryId, stat.size, stat.entries.length);
      //TODO: send mail
    }).fail(err => {
      winston.error(`parsing to csv and archive failed: ${err}`);
      Q.nfcall(integrationTaskService.setQueryTaskStatusParsingFailed, queryId);
    }).finally(() => {
      const rmdir = require('rimraf');
      rmdir(workingPath, err => {
        err && winston.warn(`remove ${workingPath} failed: ${err}`);
      });
    });
  });

  return router;
};