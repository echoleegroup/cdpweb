const es = require('event-stream');
const fs = require('fs');
const unzip = require('unzip');
const mkdirp = require('mkdirp');
const shortid = require('shortid');
const path = require('path');
const winston = require('winston');
const constants = require('../utils/constants')
const workingDirectory = shortid.generate();
const workingPath = path.resolve(constants.WORKING_DIRECTORY_PATH_ABSOLUTE, workingDirectory);

const srcPath = path.resolve(constants.ASSERTS_SPARK_FEEDBACK_PATH_ABSOLUTE, 'S1Taqv6vG.zip');

fs.createReadStream(srcPath)
  .pipe(unzip.Parse())
  .on('entry', entry => {

    let entryPath = entry.path;
    let extName = path.extname(entryPath);
    let baseName = path.basename(entryPath, '.json');
    let type = entry.type; // 'Directory' or 'File'
    let size = entry.size;

    const { Readable } = require('stream');
    const { Transform } = require('stream');
    const inStream = new Readable();

    // inStream._read = function noop() {};
    // passThrough.write = function noop() {};

    // inStream
    //   .pipe(es.split())
    //   .pipe(es.map((line, callback) => {
    //     inStream.pause();
    //
    //     winston.info(`NEW ENTRY fields ${line}`);
    //     // let promise = Q(featureMap);
    //     let rowJson = JSON.parse(line);
    //
    //     mkdirp.sync(workingPath); //create working directory
    //
    //     callback(null, rowJson);
    //     // if (!featureMap) {
    //     //   let fields = _.keys(rowJson);
    //     //
    //     //   promise = Q.all([
    //     //     Q.nfcall(integratedHelper.getFeaturesAsMap, fields),
    //     //     Q.nfcall(integratedHelper.getCsvFileName, baseName)
    //     //   ]).spread((featureConfig, csvFileName) => {
    //     //     winston.info(`NEW ENTRY ${csvFileName} fields ${line}`);
    //     //     // winston.info(`NEW LINE featureConfig: ${featureConfig}`);
    //     //     // winston.info(`NEW LINE csvFileName: ${csvFileName}`);
    //     //     featureMap = featureConfig;  //get feature configuration at once.
    //     //     workingTarget = path.resolve(workingPath, csvFileName);
    //     //     return featureMap;
    //     //   });
    //     // }
    //     //
    //     // promise.then(featureMap => {
    //     //   let rowValues = _.map(rowJson, (value, key) => {
    //     //     let config = featureMap[key];
    //     //     if (config && !_.isEmpty(config.codeGroup)) {
    //     //       return config.codeGroup[value] || value;  //transform the codeGroup value to readable term.
    //     //     } else {
    //     //       return value;
    //     //     }
    //     //   });
    //     //   callback(null, rowValues);
    //     // });
    //   }))
    //   .pipe(es.stringify());


    if ('.json' === path.extname(entryPath).toLowerCase()  && entryPath.indexOf('__MACOSX') !== 0) {
      winston.info(`NEW ENTRY ${entryPath}`);

      //entry.pipe(passThrough).pipe(inStream);
      entry.pipe(es.through()).pipe(inStream);

      // entry
      //   .pipe(es.split())
      //   .pipe(es.map((line, callback) => {
      //     winston.info(`NEW ENTRY fields ${line}`);
      //
      //     /*
      //     let promise = Q(featureMap);
      //     let rowJson = JSON.parse(line);
      //
      //     mkdirp.sync(workingPath); //create working directory
      //
      //     if (!featureMap) {
      //       let fields = _.keys(rowJson);
      //
      //       promise = Q.all([
      //         Q.nfcall(integratedHelper.getFeaturesAsMap, fields),
      //         Q.nfcall(integratedHelper.getCsvFileName, baseName)
      //       ]).spread((featureConfig, csvFileName) => {
      //         winston.info(`NEW ENTRY ${csvFileName} fields ${line}`);
      //         // winston.info(`NEW LINE featureConfig: ${featureConfig}`);
      //         // winston.info(`NEW LINE csvFileName: ${csvFileName}`);
      //         featureMap = featureConfig;  //get feature configuration at once.
      //         workingTarget = path.resolve(workingPath, csvFileName);
      //         return featureMap;
      //       });
      //     }
      //
      //     promise.then(featureMap => {
      //       let rowValues = _.map(rowJson, (value, key) => {
      //         let config = featureMap[key];
      //         if (config && !_.isEmpty(config.codeGroup)) {
      //           return config.codeGroup[value] || value;  //transform the codeGroup value to readable term.
      //         } else {
      //           return value;
      //         }
      //       });
      //       callback(null, rowValues);
      //     });
      //     */
      //   }));
    }
  });
