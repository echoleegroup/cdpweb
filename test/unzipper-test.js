const _ = require('lodash');
const unzipper = require('unzipper');
const srcPath = '/Users/hd/Documents/project/cdp/Archive.zip';
const fs = require('fs');
const path = require('path');
const es = require('event-stream');
const winston = require('winston');
// const archiver = require('archiver');
// const concat = require('concat-stream');
// const output = fs.createWriteStream(__dirname + '/unzipper-test.zip');
// // const outStream = fs.createWriteStream(workingTarget, {
// //   encoding: 'utf8',
// //   flags: 'a'
// // });
//
// // listen for all archive data to be written
// // 'close' event is fired only when a file descriptor is involved
// output.on('close', function() {
//   console.log(archive.pointer() + ' total bytes');
//   console.log('archiver has been finalized and the output file descriptor has closed.');
// });
//
// // This event is fired when the data source is drained no matter what was the data source.
// // It is not part of this library but rather from the NodeJS Stream API.
// // @see: https://nodejs.org/api/stream.html#stream_event_end
// output.on('end', function() {
//   console.log('Data has been drained');
// });
//
// const archive = archiver('zip', {
//   zlib: { level: 9 } // Sets the compression level.
// });
//
// // good practice to catch warnings (ie stat failures and other non-blocking errors)
// archive.on('warning', function(err) {
//   if (err.code === 'ENOENT') {
//     // log warning
//   } else {
//     // throw error
//     throw err;
//   }
// });
//
// archive.pipe(output);

fs.createReadStream(srcPath)
  .pipe(unzipper.Parse())
  .on('entry', entry => {

    let entryPath = entry.path;
    let extName = path.extname(entryPath);
    let baseName = path.basename(entryPath, '.json');
    let type = entry.type; // 'Directory' or 'File'
    let size = entry.size;
    if ('.json' === path.extname(entryPath).toLowerCase()  && entryPath.indexOf('__MACOSX') !== 0) {
      winston.info(`NEW ENTRY ${entryPath}`);
      let isFirstline = true;
      let featureMap = undefined;
      let output = fs.createWriteStream(`${__dirname}/${baseName}.csv`);
      // let concatLineStream = concat();
      //archive.append(concatLineStream, { name: path.basename(entryPath) });

      entry
        .pipe(es.split())
        .pipe(es.map((line, callback) => {
          entry.pause();
          // featureMap = {};
          // callback(null, line);

          // a through stream which receive each line
          if (isFirstline) {
            // if first line, fetch feature map info.
            winston.info(`NEW ENTRY ${entryPath}: isFirstline: ${isFirstline}`);
            isFirstline = false;
            //do async fetch and pipe to next step via callback function
            //get featureMap and csvFileName
            setTimeout(() => {
              featureMap = {};
              callback(null, line);
              entry.resume();
            }, 3000);
          } else {
            //if not first line, just pass through it.
            callback(null, line);
            // entry.resume();
          }

        }))
        // .on('data', line => {
        //   //in this line stream, all necessary data has been ready.
        //   // winston.info(`line: ${line} and isFirstline: ${isFirstline}`);
        //   // transform data here
        //   let rowJson = JSON.parse(line);
        //
        //   let row = _.map(rowJson, (value, key) => {
        //     let config = featureMap[key];
        //     if (config && !_.isEmpty(config.codeGroup)) {
        //       return config.codeGroup[value] || value;  //transform the codeGroup value to readable term.
        //     } else {
        //       return value;
        //     }
        //   });
        //
        //   output.write(row.join(',') + '\n');
        // })
        .pipe(es.map((line, callback) => {
          //in this line stream, all necessary data has been ready.
          // winston.info(`line: ${line} and isFirstline: ${isFirstline}`);
          // transform data here
          let rowJson = undefined;
          try {
            rowJson = JSON.parse(line);
            winston.info(`line: ${line}`);
          } catch (e) {
            winston.info(`line: ${line}`);
          }

          let row = _.map(rowJson, (value, key) => {
            let config = featureMap[key];
            if (config && !_.isEmpty(config.codeGroup)) {
              return config.codeGroup[value] || value;  //transform the codeGroup value to readable term.
            } else {
              return value;
            }
          });
          callback(null, row.join(',') + '\n');
          // return row.join(',') + '\n'
        }))
        .pipe(output)
        .on('close', () => {
          output.close();
          winston.info('entry close');
        });
    } else {
      entry.autodrain();
    }

  }).on('finish', () => {
    winston.info('unzipper finished!');
  })
  .on('close', () => {
    winston.info('unzipper close!');
  });