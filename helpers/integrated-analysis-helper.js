const winston = require('winston');
const _ = require('lodash');
const Q = require('q');
// const shortid = require('shortid');
const yauzl = require('yauzl');
const fs = require('fs');
const path = require('path');
const es = require('event-stream');
const csvWriter = require('csv-write-stream');
const integrationService = require('../services/integration-analysis-service');
const cdpService = require('../services/customer-data-platform-service');
const codeGroupService = require('../services/code-group-service');
const constants = require('../utils/constants');
const queryLogService = require('../services/query-log-service');
const integrationTaskService = require('../services/integration-analysis-task-service');
const integrationStatisticService = require('../services/integration-analysis-statistic-service');

module.exports.getFeatureAsMap = (featureId, callback) => {
  Q.nfcall(cdpService.getFeature, featureId).then(feature => {
    if (!_.isEmpty(feature.codeGroup)) {
      Q.nfcall(codeGroupService.getFeatureCodeGroup, feature.codeGroup).then(codeGroup => {
        feature.codeGroup = _.keyBy(codeGroup, 'codeGroup');
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
        return Q.nfcall(codeGroupService.getFeatureCodeGroup, feature.codeGroup).then(codeGroup => {
          feature.codeGroup = _.keyBy(codeGroup, 'codeValue');
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
  if (_.isEmpty(featureMap)) {
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
    console.log('csvFileName: ', csvFileName);
    console.log('featureMap: ', featureMap);
    let deferred = Q.defer();
    if (_.isEmpty(featureMap)) {
      winston.error(`feature map of ${baseName} not found.`);
      // return Q.reject(`feature map of ${baseName} not found.`);
      // throw new Error(`feature map of ${baseName} not found.`);
    }

    zipFile.openReadStream(entry, (err, readStream) => {
      if (err) {
        console.log(err);
        deferred.reject(err);
      } else {
        readStream.on("end", () => {
          winston.info('entry end');
          zipFile.readEntry();
        });

        Q.nfcall(streamToCsvProcessor, readStream, path.resolve(workingPath, csvFileName), featureMap).then(target => {
          deferred.resolve(target);
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
      console.log(err);
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
      winston.info(`${++lineNum} get line : ${line}`);

      let rowJson = undefined;
      try {
        rowJson = JSON.parse(line);
      } catch (e) {
        winston.warn(`parse string to json failed: ${line}`);
        rowJson = {};
      }

      let {feature_id, category, data, average, median, standard_deviation, scale_upper_bound, scale_lower_bound} = rowJson;
      winston.info(`feature_id: ${feature_id}`);
      winston.info(`category: ${category}`);
      winston.info(`average: ${average}`);
      winston.info(`median: ${median}`);
      winston.info(`standard_deviation: ${standard_deviation}`);
      winston.info(`upper_bound: ${scale_upper_bound}`);
      winston.info(`lower_bound: ${scale_lower_bound}`);
      winston.info('data: %j', data);

      // write to database, non-blocking
      Q.nfcall(integrationStatisticService.insertStatisticOfFeature,
        queryId, feature_id, category, average, median, standard_deviation, scale_upper_bound, scale_lower_bound);

      let chartData = JSON.parse(data);
      chartData.forEach((chart, index) => {
        Q.nfcall(integrationStatisticService.insertStatisticChartOfFeature,
          queryId, feature_id, chart.scale, chart.peak, chart.proportion, index + 1);
      });

      return feature_id;
    }))
    //.pipe(outStream)
    .on('close', () => {
      winston.info(`entry close: ${target}`);
      callback(null, target);
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
      console.log(err);
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
  // let metaPromise = Q();
  Q.nfcall(yauzl.open, zipPath, {lazyEntries: true}).then(zipFile => {
    zipFile.readEntry();
    zipFile.on('entry', entry => {
      let fileName = entry.fileName;
      let baseName = path.basename(fileName, '.json');
      winston.info('on entry event: ', fileName);

      if (fileName.indexOf('__MACOSX') === 0) { //ignore meta file for mac archive
        zipFile.readEntry();
      } else if ('statistic.json' === path.extname(fileName).toLowerCase()) {
        statisticPromise = queryStatisticParserPromise(queryId, zipFile, entry);
      } else if ('.json' === path.extname(fileName).toLowerCase()  && fileName.indexOf('__MACOSX') !== 0) {
        winston.info(`NEW ENTRY ${fileName}`);

        let featureIds = ('master' === baseName)? featureIdMap.master.features:
          (featureIdMap.relatives[baseName])? featureIdMap.relatives[baseName].features: [];

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
      Q.all([metaPromise, ...promises]).spread((meta, ...entries) => {
        winston.info('meta: ', meta);
        let records = meta? meta.rowCounts.master: 0;
        //archive all csv in path
        winston.info(`records : ${records}`);
        winston.info(`all csvFilePaths : ${entries}`);
        callback(null, {records, entries});
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
  Q.nfcall(queryLogService.insertQueryLog , {
    menuCode: menuCode,
    criteria,
    features,
    filters,
    reserve2: mode,
    updUser: userId
  }).then(insertRes => {
    return Q.nfcall(integrationTaskService.initQueryTask, insertRes.queryID, userId)
  }).then(resData => callback(null, resData)).fail(err => callback(err));
};

const getMinPeriod = (chartType, minPeriod) => {
  switch (chartType) {
    case 'category':
    case 'continuous':
      return minPeriod*1;
    case 'date':
      return minPeriod;
    default:
      return minPeriod;
  }
};

module.exports.backendCriteriaDataWrapper = (criteria, masterFeature, masterFilter, analyzableFeatures, relatives) => {
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
        let chartType = feature.chartType.slice(0, feature.chartType.indexOf('_')); // categ_bar類別型, cont_line數值型, date_line日期型

        return {
          feature_id: feature.featID,  // 欄位ID
          chart_type: chartType,
          ref: feature.codeGroup,
          min_period: getMinPeriod(chartType, feature.minPeriod)   //date_line日期型: 'day', 'month', 'year'，其他類型：數字
          // aggregate: ["total", "percentage"],
          // statistic: ["average", "median", "std_dev", "upper_bound", "lower_bound"]
        }
      })
    }
  }
};

module.exports.getCsvFileName = getCsvFileName;
module.exports.getFeaturesAsMap = getFeaturesAsMap;