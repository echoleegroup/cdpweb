const winston = require('winston');
const _ = require('lodash');
const Q = require('q');
const yauzl = require('yauzl');
const fs = require('fs');
const path = require('path');
const es = require('event-stream');
const csvWriter = require('csv-write-stream');
const moment = require('moment');
const integrationService = require('../services/integration-analysis-service');
const cdpService = require('../services/customer-data-platform-service');
const codeGroupService = require('../services/code-group-service');
const constants = require('../utils/constants');
const queryLogService = require('../services/query-log-service');
const integrationTaskService = require('../services/integration-analysis-task-service');
const integrationStatisticService = require('../services/integration-analysis-statistic-service');
const fileHelper = require('./file-helper');
const codeGroupHelper = require('./code-group-helper');

const CHART_CATEGORY = {
  CONTINUOUS: 'continuous',
  CATEGORY: 'category',
  TIMELINE: 'date'
};

module.exports.getFeatureAsMap = (featureId, callback) => {
  Q.nfcall(cdpService.getFeature, featureId).then(feature => {
    if (!_.isEmpty(feature.codeGroup)) {
      Q.nfcall(codeGroupHelper.getFeatureCodeGroupMap, feature.codeGroup).then(codeGroup => {
        feature.codeGroup = codeGroup;
        callback(null, feature);
      });
    } else {
      feature.codeGroup = {};
      callback(null, feature);
    }
  });
};

const getFeaturesAsMap = (featureIds, callback) => {
  Q.nfcall(integrationService.getDownloadFeaturesByIds, featureIds).then(features => {
    let promises = features.map(feature => {
      if (!_.isEmpty(feature.codeGroup)) {
        return Q.nfcall(codeGroupHelper.getFeatureCodeGroupMap, feature.codeGroup).then(codeGroup => {
          feature.codeGroup = codeGroup;
          return feature;
        });
      } else {
        feature.codeGroup = {};
        return feature;
      }
    });

    return Q.all(promises);
  }).then(features => {
    callback(null, _.keyBy(features, 'featID'));
  }).fail(err => {
    winston.error('===getFeaturesAsMap: ', err);
    callback(err);
  });
};

const getMasterFileName = (mode) => {
  switch (mode) {
    case constants.INTEGRATED_MODE.IDENTIFIED:
      return '客戶車輛主表';
    case constants.INTEGRATED_MODE.ANONYMOUS:
      return '線上用戶主檔';
  }
}

const getCsvFileName = (transFeatSetID, mode, callback) => {
  // winston.info(`transFeatSetID: ${transFeatSetID}`);
  if ('master' === transFeatSetID) {
    callback(null, `${getMasterFileName(mode)}.csv`);
  } else {
    Q.nfcall(integrationService.getFeatureSet, constants.EXPORT_RELATIVE_SET_ID, transFeatSetID).then(setInfo => {
      // winston.info(`${transFeatSetID} getFeatureSet: ${setInfo}`);
      callback(null, setInfo? `${setInfo.transFeatSetName}.csv`: `${transFeatSetID}.csv`);
    }).fail(err => {
      winston.error(`${transFeatSetID} getFeatureSet: `, err);
    });
  }
};

const emptyFeatureStreamToCsvProcessor = (stream, target, callback) => {
  let writer = csvWriter({sendHeaders: false});
  writer
    .pipe(fs.createWriteStream(target))
    .on('close', () => {
      // call the callback in writer close event to ensure the file system I/O has done,
      // preventing incomplete CSV file when archiving in for next step.
      callback(null, target);
    })
    .on('error', err => {
      winston.error('csv writer on error: ', err);
      callback(err, null);
    });

  stream
    .pipe(es.split())
    .pipe(es.mapSync((line) => {
      //in this line stream, all necessary data has been ready.
      // transform data here

      let rowJson = undefined;
      try {
        rowJson = JSON.parse(line);
      } catch (e) {
        winston.warn(`parse string to json failed: ${line}`);
        // return cb(null, '');
        return null;
      }

      writer.write(rowJson);

      return rowJson;
    }))
    .on('close', () => {
      winston.info(`entry close: ${target}`);
      writer.end();
      // callback(null, target);
    })
    .on('error', err => {
      winston.error('entry on error: ', err);
      callback(err, null);
    });
};

const streamToCsvProcessor = (stream, target, featureMap, callback) => {
  winston.info(`parsing to csv: ${target}`);
  if (_.isEmpty(featureMap)) {
    winston.warn(`feature map not found.`);
    return emptyFeatureStreamToCsvProcessor(stream, target, callback);
  }

  // let outStream = fs.createWriteStream(target);
  let headers = _.map(featureMap, 'featName');
  let writer = csvWriter({headers});
  let lineNum = 0;
  writer
    .pipe(fs.createWriteStream(target))
    .on('close', () => {
      // call the callback in writer close event to ensure the file system I/O has done,
      // preventing incomplete CSV file when archiving in for next step.
      callback(null, target);
    })
    .on('error', err => {
      winston.error('csv writer on error: ', err);
      callback(err, null);
    });

  stream
    .pipe(es.split())
    .pipe(es.mapSync((line) => {
      //in this line stream, all necessary data has been ready.
      // transform data here
      // winston.info(`${++lineNum} get line : ${line}`);

      let rowJson = undefined;
      try {
        rowJson = JSON.parse(line);
      } catch (e) {
        winston.warn(`parse string to json failed: ${line}`);
        rowJson = {};
      }

      let row = _.map(featureMap, (feature, featId) => {
        let value = rowJson[featId];
        return value?
          feature.codeGroup[value]?
            feature.codeGroup[value].codeLabel: value:
          '';
      });

      writer.write(row);

      return row;
    }))
    //.pipe(outStream)
    .on('close', () => {
      winston.info(`entry close: ${target}`);
      writer.end();
      // response to callback when writer.on('end'). callback(null, target);
    })
    .on('error', err => {
      winston.error('entry on error: ', err);
      callback(err, null);
    });
};

const streamToJson = (stream, callback) => {
  const streamBuffers = require('stream-buffers');
  let myWritableStreamBuffer = new streamBuffers.WritableStreamBuffer();
  stream
    .on('data', chunk => {
      winston.info(`meta stream on data: ${chunk}`);
      myWritableStreamBuffer.write(chunk);
    })
    .on('end', () => {
      winston.info(`meta stream end`);
      let data = myWritableStreamBuffer.getContentsAsString('utf8').replace(/\s/g, '');
      callback(null, data);
    })
    .on('error', err => {
      winston.error('meta stream on error: ', err);
      callback(err, null);
    });
};

const queryResultEntryParserPromise = (baseName, mode, featureIds, zipFile, entry, workingPath) => {
  return Q.all([
    Q.nfcall(getCsvFileName, baseName, mode),
    Q.nfcall(getFeaturesAsMap, featureIds)
  ]).spread((csvFileName, featureMap) => {
    winston.info('csvFileName: ', csvFileName);
    winston.info('featureMap: ', featureMap);
    let deferred = Q.defer();
    // if (_.isEmpty(featureMap)) {
    //   winston.warn(`feature map of ${baseName} not found.`);
    //   // return Q.reject(`feature map of ${baseName} not found.`);
    //   // throw new Error(`feature map of ${baseName} not found.`);
    // }

    zipFile.openReadStream(entry, (err, readStream) => {
      if (err) {
        winston.error(err);
        deferred.reject(err);
      } else {
        readStream.on("end", () => {
          winston.info('entry end');
          zipFile.readEntry();
        });

        Q.nfcall(streamToCsvProcessor, readStream, path.resolve(workingPath, csvFileName), featureMap).then(target => {
          deferred.resolve(csvFileName);
        }).fail(err => {
          deferred.reject(err);
        });
      }
    });

    return deferred.promise;
  });
};

const queryResultMetaParserPromise = (zipFile, entry) => {
  let deferred = Q.defer();
  // metaPromise.then(record => {
  //   return deferred.promise;
  // });

  zipFile.openReadStream(entry, (err, readStream) => {
    if (err) {
      winston.error(err);
      deferred.reject(err);
    } else {
      readStream.on("end", () => {
        winston.info('meta entry end');
        zipFile.readEntry();
      });

      Q.nfcall(streamToJson, readStream).then(data => {
        winston.info('data: ', data);
        let meta = JSON.parse(data);
        winston.info('streamToJson meta: ', meta);
        deferred.resolve(meta);
      }).fail(err => {
        winston.error('parsing meta failed ', err);
        deferred.reject(err);
      });
    }
  });

  return deferred.promise;
};

const statisticDataProcessor = (queryId, stream, callback) => {
  stream
    .pipe(es.split())
    .pipe(es.mapSync((line) => {
      //in this line stream, all necessary data has been ready.
      // transform data here
      // winston.info(`${++lineNum} get line : ${line}`);

      let rowJson = undefined;
      try {
        rowJson = JSON.parse(line);
      } catch (e) {
        winston.warn(`parse string to json failed: ${line}`);
        return null;
        // rowJson = {};
      }

      let {feature_id, category, data, average = 0, median = 0, standard_deviation, scale_upper_bound = null, scale_lower_bound = null} = rowJson;
      winston.info(`feature_id: ${feature_id}`);
      winston.info(`category: ${category}`);
      winston.info(`average: ${average}`);
      winston.info(`median: ${median}`);
      winston.info(`standard_deviation: ${standard_deviation}`);
      winston.info(`upper_bound: ${scale_upper_bound}`);
      winston.info(`lower_bound: ${scale_lower_bound}`);

      let chartData = JSON.parse(data);
      winston.info('data: %j', chartData);

      let {scale = null, peak = null, proportion = 0} = _.maxBy(chartData, 'peak') || {};

      // write to database, non-blocking
      Q.nfcall(integrationStatisticService.insertStatisticOfFeature,
        queryId, feature_id, category, average, median, standard_deviation,
        scale_upper_bound, scale_lower_bound, scale, peak, proportion);

      chartData.forEach((chart, index) => {
        Q.nfcall(integrationStatisticService.insertStatisticChartOfFeature,
          queryId, feature_id, chart.scale, chart.peak, chart.proportion, index + 1);
      });

      return feature_id;
    }))
    //.pipe(outStream)
    .on('close', () => {
      winston.info(`entry close: ${queryId}`);
      callback(null, queryId);
    })
    .on('error', err => {
      winston.error('entry on error: ', err);
      callback(err, null);
    });
};

const queryStatisticParserPromise = (queryId, zipFile, entry) => {
  let deferred = Q.defer();

  zipFile.openReadStream(entry, (err, readStream) => {
    if (err) {
      winston.error(err);
      deferred.reject(err);
    } else {
      readStream.on("end", () => {
        winston.info('statistic entry end');
        zipFile.readEntry();
      });

      Q.nfcall(statisticDataProcessor, queryId, readStream).then(target => {
        deferred.resolve(target);
      }).fail(err => {
        deferred.reject(err);
      });
    }
  });

  return deferred.promise;
};

module.exports.extractAndParseQueryResultFile = (queryId, zipPath, workingPath, featureIdMap, mode, callback) => {
  let promises = [];
  let metaPromise = undefined;
  let statisticPromise = undefined;
  // let entries = [];
  // let metaPromise = Q();
  Q.nfcall(yauzl.open, zipPath, {lazyEntries: true}).then(zipFile => {
    zipFile.readEntry();
    zipFile.on('entry', entry => {
      let fileName = entry.fileName;
      let baseName = path.basename(fileName, '.json');
      winston.info('on entry event: ', fileName);

      if (fileName.indexOf('__MACOSX') === 0) { //ignore meta file for mac archive
        zipFile.readEntry();
      } else if ('statistic.json' === fileName.toLowerCase()) {
        statisticPromise = queryStatisticParserPromise(queryId, zipFile, entry);
      } else if ('.json' === path.extname(fileName).toLowerCase()  && fileName.indexOf('__MACOSX') !== 0) {
        winston.info(`NEW ENTRY ${fileName}`);
        // entries.push(fileName);
        // let featureIds = ('master' === baseName)? featureIdMap.master.features:
        //   (featureIdMap.relatives[baseName])? featureIdMap.relatives[baseName].features: [];
        let featureIds = featureIdMap[baseName] || [];

        promises.push(queryResultEntryParserPromise(baseName, mode, featureIds, zipFile, entry, workingPath));
      } else if ('meta' === fileName) {
        metaPromise = queryResultMetaParserPromise(zipFile, entry);
      } else if (/\/$/.test(fileName)) {
        // Directory file names end with '/'.
        // Note that entires for directories themselves are optional.
        // An entry's fileName implicitly requires its parent directories to exist.
        zipFile.readEntry();
      } else {
        zipFile.readEntry();
      }


    }).on('close', () => {
      // winston.info('zip file closed! promise length: ', promises);
      // zipStream.destroy();
      // callback(null, csvFilePaths);
      Q.all([metaPromise, statisticPromise, ...promises]).spread((meta, statistic, ...entryPathes) => {
        winston.info('meta: ', meta);
        let records = meta? meta.rowCounts.master: 0;
        //archive all csv in path
        winston.info(`records : ${records}`);
        winston.info(`all csvFilePaths : ${entryPathes}`);
        callback(null, {records, entries: entryPathes});
      }).fail(err => {
        //fail to parse zip entry
        winston.error('fail to parse zip entry', err);
        callback(err);
      });
    }).on('error', err => {
      winston.error('===entry on error ', err);
      callback(err);
    });
  });
};

module.exports.initializeQueryTaskLog = (menuCode, criteria, features, filters, mode, userId, callback) => {
  Q.nfcall(queryLogService.insertQueryLog, {
    menuCode: menuCode,
    criteria,
    features,
    filters,
    reserve2: mode,
    updUser: userId
  }).then(insertRes => {
    return Q.nfcall(
      integrationTaskService.initQueryTask, insertRes.queryID, userId).then(
        resData => callback(null, insertRes.queryID))
  }).fail(err => callback(err));
};

const getMinPeriod = (chartType, minPeriod) => {
  switch (chartType) {
    case CHART_CATEGORY.CATEGORY:
    case CHART_CATEGORY.CONTINUOUS:
      return minPeriod*1;
    case CHART_CATEGORY.TIMELINE:
      return minPeriod;
    default:
      return minPeriod;
  }
};

module.exports.backendCriteriaDataWrapper = (criteria, masterFeature, masterFilter, analyzableFeatures, relatives) => {
  let today = moment().startOf('day');
  let startDay = moment().startOf('day').add(-3, 'months');
  return {
    criteria: criteria,
    export: {
      master: {
        features: masterFeature,
        filter: masterFilter
      },
      relatives: relatives
    },
    statistic: {
      features: _.map(analyzableFeatures, feature => {
        let chartCategory = feature.chartType.slice(0, feature.chartType.indexOf('_')); // categ_bar類別型, cont_line數值型, date_line日期型

        return {
          feature_id: feature.featID,  // 欄位ID
          category: chartCategory,
          ref: feature.codeGroup,
          min_period: getMinPeriod(chartCategory, feature.minPeriod),   //date_line日期型: 'day', 'month', 'year'，其他類型：數字
          period_upper_bound: today.valueOf(),
          period_lower_bound: startDay.valueOf()
        }
      })
    }
  }
};

module.exports.getCsvFileName = getCsvFileName;
module.exports.getFeaturesAsMap = getFeaturesAsMap;

module.exports.getStatisticFeaturesOfQueryTask = (queryId, callback) => {
  Q.nfcall(integrationStatisticService.getStatisticFeaturesOfTask, queryId).then(features => {
    let promises = features.map(feature => {
      if (!_.isEmpty(feature.codeGroup)) {
        return Q.nfcall(codeGroupHelper.getFeatureCodeGroupMap, feature.codeGroup).then(codeGroup => {
          feature.codeGroup = codeGroup;
          return feature;
        });
      } else {
        feature.codeGroup = {};
        return feature;
      }
    });

    return Q.all(promises);
  }).then(features => {
    callback(null, _.keyBy(features, 'featID'));
  }).fail(err => {
    winston.error('===getStatisticFeaturesOfQueryTask: ', err);
    callback(err);
  });
};

module.exports.getStatisticFeatureOfQueryTask = (queryId, featureId, callback) => {
  Q.nfcall(integrationStatisticService.getStatisticFeatureOfTask, queryId, featureId).then(feature => {
    if (!_.isEmpty(feature.codeGroup)) {
      return Q.nfcall(codeGroupHelper.getFeatureCodeGroupMap, feature.codeGroup).then(codeGroup => {
        feature.codeGroup = codeGroup;
        return feature;
      });
    } else {
      feature.codeGroup = {};
      return feature;
    }
  }).then(feature => {
    callback(null, feature);
  }).fail(err => {
    winston.error('===getStatisticFeatureOfQueryTask: ', err);
    callback(err);
  });
};

const continuousChartDataProcessor = (feature, chartData) => {
  return _.sortBy(chartData.map(data => {
    return {
      scale: Number(data.scale),
      peak: Number(data.peak),
      proportion: data.proportion,
      seq: data.seq
    }
  }), ['scale', 'seq']);
};

const categoryChartDataProcessor = (feature, chartData) => {
  return _.sortBy(chartData.map(data => {
    return {
      scale: feature.codeGroup && feature.codeGroup[data.scale]? feature.codeGroup[data.scale].codeLabel: data.scale,
      peak: Number(data.peak),
      proportion: data.proportion,
      seq: data.seq,
      sort: feature.codeGroup && feature.codeGroup[data.scale]? feature.codeGroup[data.scale].codeSort: data.scale
    }
  }), ['sort', 'seq']);
};

const timelineChartDataProcessor = (feature, chartData) => {
  return _.sortBy(chartData.map(data => {
    return {
      scale: Number(data.scale) * 1000,
      peak: Number(data.peak),
      proportion: data.proportion,
      seq: data.seq
    }
  }), ['scale', 'seq']);
};

module.exports.chartDataProcessor = (feature, chartData) => {
  switch (feature.category) {
    case CHART_CATEGORY.CONTINUOUS:
      return continuousChartDataProcessor(feature, chartData);
    case CHART_CATEGORY.CATEGORY:
      return categoryChartDataProcessor(feature, chartData);
    case CHART_CATEGORY.TIMELINE:
      return timelineChartDataProcessor(feature, chartData);
  }
};

module.exports.getIntegratedQueryData = (queryId, callback) => {
  Q.nfcall(queryLogService.getQueryLog, queryId)
    .then(queryLog => {
      let exportScript = JSON.parse(queryLog.reserve1).export;
      let creator = queryLog.updUser;
      let mode = queryLog.reserve2;
      let queryTime = queryLog.crtTime;
      let featureIdMap = Object.assign({}, {
        master: exportScript.master.features
      }, _.mapValues(exportScript.relatives, 'features'));

      callback(null, {creator, mode, featureIdMap, queryTime});
    }).fail(err => {
      callback(err);
    });
};

module.exports.downloadQueryResultPack = (queryId, url, callback) => {
  const sparkZipPath = path.join(constants.ASSERTS_SPARK_FEEDBACK_PATH_ABSOLUTE, `${queryId}.zip`);
  // const remoteDownloadUrl = `http://10.201.2.130:11002/download/${queryId}`;
  // const remoteDeleteUrl = `http://10.201.2.130:11002/delete/${queryId}`;

  Q.nfcall(fileHelper.downloadRemoteFile, url, sparkZipPath)
    .then(() => {
      callback(null, sparkZipPath);
    }).fail(err => {
      callback(err);
  });
};

module.exports.getIntegratedQueryPackParser = (queryId, packPath) => {
  return () => {
    winston.info('integrated query task start to parse: ', queryId);
    // const sparkZipPath = path.join(constants.ASSERTS_SPARK_FEEDBACK_PATH_ABSOLUTE, `${queryId}.zip`);
    const appConfig = require("../app-config");
    const subject = `${appConfig.get('PLATFORM')} - 顧客360查詢完成通知;`;
    const mailUtil = require('../utils/mail-util');

    return Q.all([
      Q.nfcall(this.getIntegratedQueryData, queryId),
      Q.nfcall(integrationStatisticService.deleteStatisticChartOfFeature, queryId),
      Q.nfcall(integrationStatisticService.deleteStatisticOfTask, queryId)
    ]).fail(err => {
      winston.error('get task query data failed(queryId=%j): ', queryId, err);
      throw err;
    }).spread(task => {
      // no task
      if (!task) {
        winston.warn('integrated query task is not exist. queryId = ', queryId);
        try {
          fs.unlinkSync(packPath);
        } catch (err) {
          winston.warn(`unlink file ${packPath} failed: ${err}`);
        }
        // return Q.resolve();
        throw new Error(`integrated query task is not exist. queryId = ${queryId}`);
      } else if (!fs.existsSync(packPath)) {
        Q.nfcall(integrationTaskService.setQueryTaskStatusResultPackNotFound, queryId)
          .then(status => {
            throw new Error(status)
          }).fail(err => {
            winston.error('update query task status to result pack not found failed(task=%j): ', task, err);
            throw err;
          });
      }

      //unpack and analysis
      const userService = require('../services/user-service');
      const workingPath = path.resolve(constants.WORKING_DIRECTORY_PATH_ABSOLUTE, require('shortid').generate());
      require('mkdirp')(workingPath);

      return Q.nfcall(this.extractAndParseQueryResultFile,
        queryId, packPath, workingPath, task.featureIdMap, task.mode)
        .then(parsingInfo => {

          const finalZipPath = path.join(constants.ASSERTS_SPARK_INTEGRATED_ANALYSIS_ASSERTS_PATH_ABSOLUTE, `${queryId}.zip`);
          // records = info.records;

          return Q.nfcall(fileHelper.archiveFiles, workingPath, parsingInfo.entries, finalZipPath).fail(err => {
            winston.error('parsing to csv and archive failed: ', err);
            throw err;
          }).then(archiveStat => {
            winston.info('archive stat: %j', archiveStat);
            return Q.all([
              Q.nfcall(userService.getUserInfo, task.creator).fail(err => {
                winston.error('get query user info failed: ', err);
              }),
              Q.nfcall(
                integrationTaskService.setQueryTaskStatusComplete, queryId, archiveStat.size,
                JSON.stringify(parsingInfo.entries), parsingInfo.records).fail(err => {
                winston.error('set query task status as complete failed: ', err);
              })
            ]).spread((userInfo, ...others) => {
              winston.info('get user info: ', userInfo);
              let to = userInfo.email;
              let data = {
                userName: userInfo.userName,
                queryTime: moment.utc(task.queryTime).format('YYYY/MM/DD HH:mm:ss'),
                reviewUrl: `https://${process.env.HOST}:${process.env.PORT}/integration/${task.mode}/query/${queryId}`
              };
              Q.nfcall(mailUtil.sendByTemplate, '102', to, subject, data)
                .fail(err => {
                  winston.error('send integrated query(queryId=%s) result mail to %s failed: ', queryId, to, err);
                });
              return null;
            });
          });
        }).fail(err => {
          winston.error('parsing integrated query result failed(queryID=%s): ', queryId, err);
          Q.nfcall(integrationTaskService.setQueryTaskStatusParsingFailed, queryId).fail(err => {
            winston.error('set query task status as parsing-failed failed: ', err);
          });
        }).finally(() => {
          winston.info('archiveFiles finally');
          const rmdir = require('rimraf');
          rmdir(workingPath, err => {
            err && winston.warn(`remove ${workingPath} failed: `, err);
          });
        });
      });
  };
};

module.exports.isQueryServiceDisabled = () => {
  const locker = path.resolve(__dirname, '..', '.360-lock');
  return fs.existsSync(locker);
}

module.exports.disableQueryService = () => {
  const locker = path.resolve(__dirname, '..', '.360-lock');
  fs.writeFileSync(locker, moment().format('YYYY-MM-DD HH:mm:ss'));
};

module.exports.resumeQueryService = () => {
  const locker = path.resolve(__dirname, '..', '.360-lock');
  fs.unlinkSync(locker);
};

module.exports.getQueryPosterHandler = (queryId, mode, queryScriptStage2, queryScriptStage3) => {

  if (mode === constants.INTEGRATED_MODE.IDENTIFIED) {
    return this.identicalQueryPoster(queryId, queryScriptStage2, queryScriptStage3);
  } else if (mode === constants.INTEGRATED_MODE.ANONYMOUS) {
    return this.anonymousQueryPoster(queryId, queryScriptStage3);
  } else {
    return () => Q();
  }

};

module.exports.identicalQueryPoster = (queryId, queryScriptStage2, queryScriptStage3) => {
  // const isServiceDisabled = this.isQueryServiceDisabled();
  // if (isServiceDisabled) {
  //   return callback(null, integrationTaskService.PROCESS_STATUS.PENDING);
  // }

  return () => {
    return Q.nfcall(integrationTaskService.setQueryTaskStatusRemoteProcessing, queryId).then(() => {
      return Q.nfcall(integrationTaskService.identicalQueryPoster, queryId, queryScriptStage2, queryScriptStage3);
    }).fail(err => {
      winston.error('===post integrated query script request failed(queryID=%s): ', queryId, err);
      return Q.nfcall(integrationTaskService.setQueryTaskStatusRemoteServiceUnavailable, queryId);
    });
  };
};

module.exports.anonymousQueryPoster = (queryId, queryScriptStage3) => {
  return Q.nfcall(integrationTaskService.setQueryTaskStatusRemoteProcessing, queryId).then(() => {
    return Q.nfcall(integrationTaskService.anonymousQueryPoster, queryId, queryScriptStage3);
  }).fail(err => {
    winston.error('===post anonymous integrated query script request failed(queryID=%s): ', queryId, err);
    return Q.nfcall(integrationTaskService.setQueryTaskStatusRemoteServiceUnavailable, queryId);
  });
};