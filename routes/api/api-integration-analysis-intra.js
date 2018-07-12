'use strict';

const express = require('express');
const path = require('path');
const winston = require('winston');
const Q = require('q');
// const _ = require('lodash');
const factory = require("../../middlewares/response-factory");
const integratedAnalysisHelper = require('../../helpers/integrated-analysis-helper');
const integrationTaskService = require('../../services/integration-analysis-task-service');
// const integrationAnalysisService = require('../../services/integration-analysis-statistic-service');
const constants = require('../../utils/constants');
const queue = require('../../utils/queue');

module.exports = (app) => {
  winston.info('[api-model] Creating api-integration-analysis-intra route.');
  const router = express.Router();

  router.get('/export/query/parsing/:queryId', factory.ajax_response_factory(), (req, res) => {
    const queryId = req.params.queryId;
    Q.nfcall(integrationTaskService.getQueryTask, queryId).then(task => {
      if (!task) {
        return res.json(null, 401, `task ${queryId} not found`);
      }

      return Q.nfcall(integrationTaskService.setQueryTaskStatusParsing, queryId).then(() => {
        res.json();
        const resultPackPath = path.join(constants.ASSERTS_SPARK_FEEDBACK_PATH_ABSOLUTE, `${queryId}.zip`);
        queue.push(queryId, integratedAnalysisHelper.getIntegratedQueryPackParser(queryId, resultPackPath));
      }).fail(err => {
        winston.error('update query task status to parsing failed(task=%j): ', task, err);
        return res.json(null, 500, 'internal service error');
      });

    }).fail(err => {
      winston.error('get integrated query task failed: ', err);
      return res.json(null, 500, 'internal service error');
    });



    /*
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
      let data = {
        userName: userInfo.userName,
        queryTime: moment.utc(queryLog.crtTime).format('YYYY/MM/DD HH:mm:ss'),
        reviewUrl: `https://${process.env.HOST}:${process.env.PORT}/integration/${mode}/query/${queryId}`
      };
      Q.nfcall(mailUtil.sendByTemplate, '102', to, subject, data);
    }).fail(err => {
      winston.error('/export/query/parsing/%s error: ', queryId, err);
    }).finally(() => {
      const rmdir = require('rimraf');
      rmdir(workingPath, err => {
        err && winston.warn(`remove ${workingPath} failed: ${err}`);
      });
    });
    */
  });

  router.get('/export/query/ready/:ip/:port/:queryId', factory.ajax_response_factory(), (req, res) => {
    const queryId = req.params.queryId;
    Q.nfcall(integrationTaskService.getQueryTask, queryId).then(task => {
      if (!task) {
        return res.json(null, 401, `task ${queryId} not found`);
      }

      const remoteDownloadUrl = `http://${req.params.ip}:${req.params.port}/download/${queryId}`;
      const remoteDeleteUrl = `http://${req.params.ip}:${req.params.port}/delete/${queryId}`;
      return Q.nfcall(integratedAnalysisHelper.downloadQueryResultPack, queryId, remoteDownloadUrl).then(resultPackPath => {
        //
        return Q.nfcall(integrationTaskService.setQueryTaskStatusParsing, queryId)
          .then(() => {
            res.json();
            require('request-promise-native').post(remoteDeleteUrl);
            return queue.push(queryId, integratedAnalysisHelper.getIntegratedQueryPackParser(queryId, resultPackPath));
          }).fail(err => {
            winston.error('update query task status to parsing failed(task=%j): ', task, err);
            return res.json(null, 500, 'internal service error');
          });
      }).fail(err => {
        winston.error('download query result pack(queryId=%s) failed: ', queryId,  err);
        Q.nfcall(integrationTaskService.setQueryTaskStatusRemoteFileNotFound, queryId);
        return res.json(null, 404, `${queryId}.zip not found`);
      })
    }).fail(err => {
      winston.error('get integrated query task failed: ', err);
      return res.json(null, 500, 'internal service error');
    });


    /*
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
      let data = {
        userName: userInfo.userName,
        queryTime: moment.utc(queryLog.crtTime).format('YYYY/MM/DD HH:mm:ss'),
        reviewUrl: `https://${process.env.HOST}:${process.env.PORT}/integration/${mode}/query/${queryId}`
      };
      Q.nfcall(mailUtil.sendByTemplate, '102', to, subject, data);
    }).fail(err => {
      winston.error('/export/query/ready/:ip/:port/:queryId error: ', err);
    }).finally(() => {
      const rmdir = require('rimraf');
      rmdir(workingPath, err => {
        err && winston.warn(`remove ${workingPath} failed: `, err);
      });
    });
    */
  });

  return router;
};