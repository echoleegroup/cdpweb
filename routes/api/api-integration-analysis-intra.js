'use strict';

const express = require('express');
const moment = require('moment');
const winston = require('winston');
const Q = require('q');
const _ = require('lodash');
const shortid = require('shortid');
const appConfig = require("../../app-config");
const factory = require("../../middlewares/response-factory");
const fileHelper = require('../../helpers/file-helper');
const integratedHelper = require('../../helpers/integrated-analysis-helper');
const queryLogService = require('../../services/query-log-service');
const userService = require('../../services/user-service');
const integrationTaskService = require('../../services/integration-analysis-task-service');
const integrationAnalysisService = require('../../services/integration-analysis-statistic-service');
const constants = require('../../utils/constants');

module.exports = (app) => {
  winston.info('[api-model] Creating api-integration-analysis route.');
  const router = express.Router();

  router.get('/export/query/parsing/:queryId', factory.ajax_response_factory(), (req, res) => {
    const path = require('path');
    const mailUtil = require('../../utils/mail-util');
    const queryId = req.params.queryId;
    const sparkZipPath = path.join(constants.ASSERTS_SPARK_FEEDBACK_PATH_ABSOLUTE, `${queryId}.zip`);
    const finalZipPath = path.join(constants.ASSERTS_SPARK_INTEGRATED_ANALYSIS_ASSERTS_PATH_ABSOLUTE, `${queryId}.zip`);
    const mkdirp = require('mkdirp');
    const tempFolderName = shortid.generate();
    const workingPath = path.resolve(constants.WORKING_DIRECTORY_PATH_ABSOLUTE, tempFolderName);
    const subject = `${appConfig.get('PLATFORM')} - 顧客360查詢完成通知;`;
    mkdirp(workingPath);
    let featureIdMap = {};
    let userId = undefined;
    let mode = undefined;
    let records = 0;
    let queryLog = undefined;

    Q.nfcall(queryLogService.getQueryLogProcessingData, queryId).then(queryLogData => {
      if (!queryLogData) {
        res.json(null, 401, `task ${queryId} not found`);
        throw `task ${queryId} not found`;
      } else {
        return Q.all([
          Q.nfcall(integrationAnalysisService.deleteStatisticChartOfFeature, queryId),
          Q.nfcall(integrationAnalysisService.deleteStatisticOfTask, queryId)
        ]).then(delResult => {
          return queryLogData;
        });
      }
    }).then(queryLogData => {
      res.json();

      queryLog = queryLogData;
      userId = queryLog.updUser;
      // winston.info('queryLog: ', queryLog);
      featureIdMap = JSON.parse(queryLog.reserve1).export;
      mode = queryLog.reserve2;
      // winston.info('query log process Data: %j', featureIdMap);
      Q.nfcall(integrationTaskService.setQueryTaskStatusParsing, queryId).fail(err => {
        winston.error('fail to update query task status: ', err);
      });

      return Q.nfcall(integratedHelper.extractAndParseQueryResultFile,
        queryId, sparkZipPath, workingPath, featureIdMap, mode)
        .then(info => {
          records = info.records;
          winston.info(`parsing to csv: ${info.entries}`);
          return Q.nfcall(fileHelper.archiveFiles, info.entries, finalZipPath);
        }).then(destZipPath => {
          winston.info(`archive finished: ${destZipPath}`);
          return Q.nfcall(fileHelper.archiveStat, destZipPath);
        }).fail(err => {
          winston.error('parsing to csv and archive failed: ', err);
          Q.nfcall(integrationTaskService.setQueryTaskStatusParsingFailed, queryId).fail(err => {
            winston.error('set query task status as parsing-failed failed: ', err);
          });
          throw err;
        });
    }).then(stat => {
      winston.info('archive stat: %j', stat);
      return Q.all([
        Q.nfcall(userService.getUserInfo, userId),
        Q.nfcall(
          integrationTaskService.setQueryTaskStatusComplete, queryId, stat.size,
          JSON.stringify(stat.entries), records)
      ]);
    }).spread((userInfo, ...others) => {
      let to = userInfo.email;
      let content = `${userInfo.userName}, 您好<br/>` +
        `您於 ${moment.utc(queryLog.crtTime).format('YYYY/MM/DD HH:mm:ss')} 送出的顧客360查詢已完成，` +
        `請<a href="https://${process.env.HOST}:${process.env.PORT}/integration/${mode}/query/${queryId}">查看結果</a>`;
      Q.nfcall(mailUtil.mail, to, {subject, content});
    }).fail(err => {
      winston.error('/export/query/ready/:ip/:port/:queryId error: ', err);
    }).finally(() => {
      const rmdir = require('rimraf');
      rmdir(workingPath, err => {
        err && winston.warn(`remove ${workingPath} failed: ${err}`);
      });
    });
  });

  router.get('/export/query/ready/:ip/:port/:queryId', factory.ajax_response_factory(), (req, res) => {
    const path = require('path');
    const mailUtil = require('../../utils/mail-util');
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
    const subject = `${appConfig.get('PLATFORM')} - 顧客360查詢完成通知;`;
    mkdirp(workingPath);
    let featureIdMap = {};
    let userId = undefined;
    let mode = undefined;
    let records = 0;
    let queryLog = undefined;

    // winston.info(`===download remote file: ${remoteDownloadUrl}`);

    Q.nfcall(queryLogService.getQueryLogProcessingData, queryId).then(queryLogData => {
      if (!queryLogData) {
        res.json(null, 401, `task ${queryId} not found`);
        throw `task ${queryId} not found`;
      } else {
        queryLog = queryLogData;
        userId = queryLog.updUser;
        // winston.info('queryLog: ', queryLog);
        featureIdMap = JSON.parse(queryLog.reserve1).export;
        mode = queryLog.reserve2;
        // winston.info('query log process Data: %j', featureIdMap);
        return Q.nfcall(fileHelper.downloadRemoteFile, remoteDownloadUrl, sparkZipPath).fail(err => {
          Q.nfcall(integrationTaskService.setQueryTaskStatusRemoteFileNotFound, queryId);
          res.json(null, 404, `${queryId}.zip not found`);
          throw `${queryId}.zip not found`;
        });
      }
    }).then(() => {
      res.json();
      //delete remote file
      // winston.info(`===delete remote file: ${remoteDeleteUrl}`);
      require('request-promise-native').post(remoteDeleteUrl);
      Q.nfcall(integrationTaskService.setQueryTaskStatusParsing, queryId).fail(err => {
        winston.error('fail to update query task status: ', err);
      });
      return Q.nfcall(integratedHelper.extractAndParseQueryResultFile,
        queryId, sparkZipPath, workingPath, featureIdMap, mode)
        .then(info => {
          records = info.records;
          winston.info(`parsing to csv: ${info.entries}`);
          return Q.nfcall(fileHelper.archiveFiles, info.entries, finalZipPath);
        }).then(destZipPath => {
          winston.info(`archive finished: ${destZipPath}`);
          return Q.nfcall(fileHelper.archiveStat, destZipPath);
        }).fail(err => {
          winston.error('parsing to csv and archive failed: ', err);
          Q.nfcall(integrationTaskService.setQueryTaskStatusParsingFailed, queryId).fail(err => {
            winston.error('set query task status as parsing-failed failed: ', err);
          });
          throw err;
        });
    }).then(stat => {
      winston.info('archive stat: %j', stat);
      return Q.all([
        Q.nfcall(userService.getUserInfo, userId),
        Q.nfcall(
          integrationTaskService.setQueryTaskStatusComplete, queryId, stat.size,
          JSON.stringify(stat.entries), records)
      ]);
    }).spread((userInfo, ...others) => {
      let to = userInfo.email;
      let content = `${userInfo.userName}, 您好<br/>` +
        `您於 ${moment.utc(queryLog.crtTime).format('YYYY/MM/DD HH:mm:ss')} 送出的顧客360查詢已完成，` +
        `請<a href="https://${process.env.HOST}:${process.env.PORT}/integration/${mode}/query/${queryId}">查看結果</a>`;
      Q.nfcall(mailUtil.mail, to, {subject, content});
    }).fail(err => {
      winston.error('/export/query/ready/:ip/:port/:queryId error: ', err);
    }).finally(() => {
      const rmdir = require('rimraf');
      rmdir(workingPath, err => {
        err && winston.warn(`remove ${workingPath} failed: `, err);
      });
    });
  });

  return router;
};