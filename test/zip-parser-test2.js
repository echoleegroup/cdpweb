const _ = require('lodash');
const es = require('event-stream');
const fs = require('fs');
const unzipper = require('unzipper');
const mkdirp = require('mkdirp');
const shortid = require('shortid');
const path = require('path');
const winston = require('winston');
const Q = require('q');
const constants = require('../utils/constants')
const workingDirectory = shortid.generate();
const workingPath = path.resolve(constants.WORKING_DIRECTORY_PATH_ABSOLUTE, workingDirectory);
const integratedHelper = require('../helpers/integrated-analysis-helper');

const srcPath = path.resolve(constants.ASSERTS_SPARK_FEEDBACK_PATH_ABSOLUTE, 'S1Taqv6vG.zip');
const { Transform } = require('stream');

fs.createReadStream(srcPath)
  .pipe(unzipper.Parse())
  .pipe(Transform({
    objectMode: true,
    transform: function(entry,e,cb) {
      let entryPath = entry.path;
      let extName = path.extname(entryPath);
      let baseName = path.basename(entryPath, '.json');
      let type = entry.type; // 'Directory' or 'File'
      let size = entry.size;

      if ('.json' === path.extname(entryPath).toLowerCase()  && entryPath.indexOf('__MACOSX') !== 0) {
        let featureMap = undefined;
        let workingTarget = undefined;

        entry
          .pipe(es.split())
          .pipe(es.map((line, callback) => {
            entry.pause();
            winston.info(`NEW ENTRY fields ${line}`);

            let promise = Q(featureMap);
            let rowJson = JSON.parse(line);

            mkdirp.sync(workingPath); //create working directory

            if (!featureMap) {
              console.log('workingPath: ', workingPath);

              let fields = _.keys(rowJson);

              promise = Q.all([
                Q.nfcall(integratedHelper.getFeaturesAsMap, fields),
                Q.nfcall(integratedHelper.getCsvFileName, baseName)
              ]).spread((featureConfig, csvFileName) => {
                winston.info(`NEW ENTRY ${csvFileName} fields ${line}`);
                // winston.info(`NEW LINE featureConfig: ${featureConfig}`);
                // winston.info(`NEW LINE csvFileName: ${csvFileName}`);
                featureMap = featureConfig;  //get feature configuration at once.
                workingTarget = path.resolve(workingPath, csvFileName);
                return featureMap;
              });
            }

            promise.then(featureMap => {
              let rowValues = _.map(rowJson, (value, key) => {
                let config = featureMap[key];
                if (config && !_.isEmpty(config.codeGroup)) {
                  return config.codeGroup[value] || value;  //transform the codeGroup value to readable term.
                } else {
                  return value;
                }
              });
              callback(null, rowValues);
              entry.resume();
            });

          }));
      } else {
        entry.autodrain();
        cb();
      }
    }
  }));
