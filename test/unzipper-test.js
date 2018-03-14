const _ = require('lodash');
const unzipper = require('unzipper');
const srcPath = '/Users/hd/Documents/project/cdp/Archive.zip';
const fs = require('fs');
const path = require('path');
const es = require('event-stream');
const winston = require('winston');
const csvWriter = require('csv-write-stream');

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
      let featureMap = {};
      let writer = csvWriter({headers: ['head1', 'head2', 'head3', 'head4']});
      writer
        .pipe(fs.createWriteStream(`${__dirname}/${baseName}.csv`))
        .on('close', () => {
          console.log('writer close');
        })
        .on('end', () => {
          console.log('writer end');
        })
        .on('finish', () => {
          console.log('writer finish');
        });

      entry
        .pipe(es.split())
        .pipe(es.mapSync(line => {
          //in this line stream, all necessary data has been ready.
          // winston.info(`line: ${line} and isFirstline: ${isFirstline}`);
          // transform data here
          let rowJson = undefined;
          try {
            rowJson = JSON.parse(line);
            // winston.info(`line: ${line}`);
          } catch (e) {
            winston.info(`line: ${line}`);
            return null;
          }

          let row = _.map(rowJson, (value, key) => {
            let config = featureMap[key];
            if (config && !_.isEmpty(config.codeGroup)) {
              return config.codeGroup[value] || value;  //transform the codeGroup value to readable term.
            } else {
              return value;
            }
          });
          writer.write(row);
          return row;
          // callback(null, row.join(',') + '\n');
          // return row.join(',') + '\n'
        }))
        // .pipe(output)
        .on('close', () => {
          writer.end();
          // output.close();
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