const winston = require('winston');
const _ = require('lodash');
const Q = require('q');
const shortid = require('shortid');
const unzipper = require('unzipper');
const fs = require('fs');
const path = require('path');
const es = require('event-stream');
const integratedHelper = require('../helpers/integrated-analysis-helper');
const integrationService = require('../services/integration-analysis-service');
const cdpService = require('../services/customer-data-platform-service');
const codeGroupService = require('../services/code-group-service');
const constants = require('../utils/constants');

module.exports.featureSetsToTreeNodes = (setData) => {

  winston.info('===featureSetsToTreeNodes: %j', setData);
  return setData.map(set => {
    return {
      type: 'tail',
      id: set.transFeatSetID,
      label: set.transFeatSetName
    };
  });
};

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
          feature.codeGroup = _.keyBy(codeGroup, 'codeGroup');
          return feature;
        });
      } else {
        feature.codeGroup = {};
        return feature;
      }
    });

    return Q.all(promises);
  }).then(features => {
    callback(null, features);
  }).fail(err => {
    winston.error(`===getFeaturesAsMap: ${err}`);
    callback(err);
  });
};

module.exports.getCsvFileName = (transFeatSetID, callback) => {
  // winston.info(`transFeatSetID: ${transFeatSetID}`);
  if ('master' === transFeatSetID) {
    callback(null, '客戶車輛主表.csv');
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

// module.exports.entryParser = (entryStream, tempWorkingPath, fileBaseName, callback) => {
//   let isFirstline = true;
//   let featureMap = undefined;
//   let outStream = undefined;
//   let outStreamPath = undefined;
//   let lineNum = 0;
//
//   Q.nfcall(integratedHelper.getCsvFileName, fileBaseName).then(csvFileName => {
//     outStreamPath = path.resolve(tempWorkingPath, csvFileName);
//     outStream = fs.createWriteStream(outStreamPath);
//
//     entryStream
//       .pipe(es.split())
//       .pipe(es.map((line, cb) => {
//         // winston.info(`${++lineNum} parsing line ${line} isFirstline ${isFirstline}`);
//         // entryStream.pause();
//
//         if (isFirstline) {
//           isFirstline = false;
//           //fetch feature map and csv file name
//           let rowJson = JSON.parse(line);
//           let header = _.keys(rowJson);
//
//           Q.nfcall(integratedHelper.getFeaturesAsMap, header).then(featureResult => {
//             featureMap = featureResult;
//             // entryStream.resume();
//             cb(null, line);
//           }).fail(err => {
//             cb(err, null);
//           });
//         } else {
//           cb(null, line);
//         }
//       }))
//       .pipe(es.mapSync((line) => {
//         //in this line stream, all necessary data has been ready.
//         // transform data here
//
//         let rowJson = undefined;
//         try {
//           rowJson = JSON.parse(line);
//         } catch (e) {
//           winston.warn(`${fileBaseName}.json parse string to json failed: ${line}`);
//           // return cb(null, '');
//           return '';
//         }
//
//         let row = _.map(rowJson, (value, key) => {
//           let config = featureMap[key];
//           if (config && !_.isEmpty(config.codeGroup)) {
//             return config.codeGroup[value] || value;  //transform the codeGroup value to readable term.
//           } else {
//             return value;
//           }
//         });
//         return row.join(',') + '\n';
//         // return cb(null, row.join(',') + '\n');
//       }))
//       .pipe(outStream)
//       // .promise();
//       .on('close', () => {
//         // outStream.close();
//         // entryStream.destroy();
//         winston.info(`entry close: ${outStreamPath}`);
//         callback(null, outStreamPath);
//       })
//       .on('error', err => {
//         winston.error(`entry on error: ${err}`);
//         callback(err, null);
//       });
//   });
// };

module.exports.streamToCsvProcessor = (stream, target, featureMap, callback) => {
  let outStream = fs.createWriteStream(target);
  // let lineNum = 0;
  stream
    .pipe(es.split())
    .pipe(es.mapSync((line) => {
      //in this line stream, all necessary data has been ready.
      // transform data here
      // winston.info(`${++lineNum} parsing line ${line}`);

      let rowJson = undefined;
      try {
        rowJson = JSON.parse(line);
      } catch (e) {
        winston.warn(`parse string to json failed: ${line}`);
        // return cb(null, '');
        return '';
      }

      let row = _.map(rowJson, (value, key) => {
        let config = featureMap[key];
        if (config && !_.isEmpty(config.codeGroup)) {
          return config.codeGroup[value] || value;  //transform the codeGroup value to readable term.
        } else {
          return value;
        }
      });
      return row.join(',') + '\n';
      // return cb(null, row.join(',') + '\n');
    }))
    .pipe(outStream)
    // .promise();
    .on('close', () => {
      // outStream.close();
      // entryStream.destroy();
      winston.info(`entry close: ${target}`);
      callback(null, target);
    })
    .on('error', err => {
      winston.error(`entry on error: ${err}`);
      callback(err, null);
    });
};

module.exports.extractAndParseQueryResultFile = (zipPath, workingPath, featureIdMap, callback) => {
  winston.info('extractAndParseQueryResultFile featureIdMap: ', featureIdMap);

  let promises = [];
  let records = 0;
  let zipStream = fs.createReadStream(zipPath);
  zipStream
    .pipe(unzipper.Parse())
    .on('entry', entry => {

      let entryPath = entry.path;
      // let extName = path.extname(entryPath);
      let baseName = path.basename(entryPath, '.json');
      // let type = entry.type; // 'Directory' or 'File'
      // let size = entry.size;

      if ('.json' === path.extname(entryPath).toLowerCase()  && entryPath.indexOf('__MACOSX') !== 0) {
        winston.info(`NEW ENTRY ${entryPath}`);

        let featureIds = ('master' === baseName)? featureIdMap.master.features:
          (featureIdMap.relatives[baseName])? featureIdMap.relatives[baseName].features: [];

        promises.push(
          Q.all([
            Q.nfcall(this.getCsvFileName, baseName),
            Q.nfcall(this.getFeaturesAsMap, featureIds)
          ]).spread((csvFileName, featureMap) => {
            return Q.nfcall(this.streamToCsvProcessor, entry, path.resolve(workingPath, csvFileName), featureMap);
          })
        );
      } else {
        entry.autodrain();
      }
    })
    .on('close', () => {
      winston.info('unzipper close!');
    })
    .on('error', err => {
      winston.error(`===entry on error ${err}`);
      callback(err);
    })
    .on('finish', () => {
      winston.info('unzipper finished! promise length: ', promises);
      // zipStream.destroy();
      // callback(null, csvFilePaths);
      Q.all(promises).then(entries => {
        //archive all csv in path
        // winston.info(`all csvFilePaths : ${csvFilePaths}`);
        callback(null, {records, entries});
      }).fail(err => {
        //log query task status to parsing fail
        winston.error(err);
        callback(err);
      });
    });
};