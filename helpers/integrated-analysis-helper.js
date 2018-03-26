const winston = require('winston');
const _ = require('lodash');
const Q = require('q');
// const shortid = require('shortid');
const yauzl = require('yauzl');
const fs = require('fs');
const path = require('path');
const es = require('event-stream');
const csvWriter = require('csv-write-stream');
// const integratedHelper = require('../helpers/integrated-analysis-helper');
const integrationService = require('../services/integration-analysis-service');
const cdpService = require('../services/customer-data-platform-service');
const codeGroupService = require('../services/code-group-service');
const constants = require('../utils/constants');

// module.exports.featureSetsToTreeNodes = (setData) => {
//
//   // winston.info('===featureSetsToTreeNodes: %j', setData);
//   return setData.map(set => {
//     return {
//       type: 'tail',
//       id: set.nodeID,
//       label: set.nodeName
//     };
//   });
// };

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

module.exports.getFeaturesAsMap = (featureIds, callback) => {
  Q.nfcall(cdpService.getFeatures, featureIds).then(features => {
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
    winston.error(`===getFeaturesAsMap: ${err}`);
    callback(err);
  });
};

const MASTER_FILE_NAME_MAPPER = {
  identified: '客戶車輛主表',
  anonymous: '線上用戶主檔'
};

module.exports.getCsvFileName = (transFeatSetID, mod, callback) => {
  // winston.info(`transFeatSetID: ${transFeatSetID}`);
  if ('master' === transFeatSetID) {
    callback(null, `${MASTER_FILE_NAME_MAPPER[mod]}.csv`);
  } else {
    Q.nfcall(integrationService.getFeatureSet, constants.EXPORT_RELATIVE_SET_ID, transFeatSetID).then(setInfo => {
      // winston.info(`${transFeatSetID} getFeatureSet: ${setInfo}`);
      callback(null, setInfo? `${setInfo.transFeatSetName}.csv`: `${transFeatSetID}.csv`);
    }).fail(err => {
      winston.error(`${transFeatSetID} getFeatureSet: ${err}`);
      callback(err);
    });
  }
};

module.exports.emptyFeatureStreamToCsvProcessor = (stream, target, callback) => {
  let writer = csvWriter({sendHeaders: false});
  writer
    .pipe(fs.createWriteStream(target))
    .on('close', () => {
      // call the callback in writer close event to ensure the file system I/O has done,
      // preventing incomplete CSV file when archiving in for next step.
      callback(null, target);
    })
    .on('error', err => {
      winston.error(`csv writer on error: ${err}`);
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
      winston.error(`entry on error: ${err}`);
      callback(err, null);
    });
};

module.exports.streamToCsvProcessor = (stream, target, featureMap, callback) => {
  if (_.isEmpty(featureMap)) {
    return this.emptyFeatureStreamToCsvProcessor(stream, target, callback);
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
      winston.error(`csv writer on error: ${err}`);
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
      // callback(null, target);
    })
    .on('error', err => {
      winston.error(`entry on error: ${err}`);
      callback(err, null);
    });
};

module.exports.streamToJson = (stream, callback) => {
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
      winston.error(`meta stream on error: ${err}`);
      callback(err, null);
    });
};

module.exports.extractAndParseQueryResultFile = (zipPath, workingPath, featureIdMap, mod, callback) => {
  let promises = [];
  let metaPromise = undefined;
  // let metaPromise = Q();
  Q.nfcall(yauzl.open, zipPath, {lazyEntries: true}).then(zipFile => {
    zipFile.readEntry();
    zipFile.on('entry', entry => {
      let fileName = entry.fileName;
      let baseName = path.basename(fileName, '.json');
      winston.info('on entry event: ', fileName);

      if (fileName.indexOf('__MACOSX') === 0) {
        zipFile.readEntry();
      } else if ('.json' === path.extname(fileName).toLowerCase()  && fileName.indexOf('__MACOSX') !== 0) {
        winston.info(`NEW ENTRY ${fileName}`);

        let featureIds = ('master' === baseName)? featureIdMap.master.features:
          (featureIdMap.relatives[baseName])? featureIdMap.relatives[baseName].features: [];

        promises.push(
          Q.all([
            Q.nfcall(this.getCsvFileName, baseName, mod),
            Q.nfcall(this.getFeaturesAsMap, featureIds)
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

                Q.nfcall(this.streamToCsvProcessor, readStream, path.resolve(workingPath, csvFileName), featureMap).then(target => {
                  deferred.resolve(target);
                }).fail(err => {
                  deferred.reject(err);
                });
              }
            });

            return deferred.promise;
          })
        );
      } else if ('meta' === fileName) {
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
              metaPromise = deferred.promise;
              zipFile.readEntry();
            });

            Q.nfcall(this.streamToJson, readStream).then(data => {
              winston.info('data: ', data);
              let meta = JSON.parse(data);
              winston.info('streamToJson meta: ', meta);
              deferred.resolve(meta);
            }).fail(err => {
              winston.error(`parsing meta failed ${err}`);
              deferred.reject(err);
            });
          }
        });
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
        //log query task status to parsing fail
        winston.error(err);
        callback(err);
      });
    }).on('error', err => {
      winston.error(`===entry on error ${err}`);
      callback(err);
    });
  });
};