const fs = require('fs');
const _ = require('lodash');
const path = require('path');
const request = require('request');
const Q = require('q');
const winston = require('winston');

module.exports.buildXlsxWorkbook = ({
                                    sheetName='模型名單',
                                    xlsxDataSet=[[]]
                                  }, callback) => {
  const XlsxPopulate = require('xlsx-populate');

  return XlsxPopulate.fromBlankAsync().then(workbook => {
    workbook.sheet(0).name(sheetName).cell("A1").value(xlsxDataSet);
    callback(null, workbook);

    // Write to file.
    // return workbook.toFileAsync("/Users/hd/Downloads/test-3.xlsx", { password: "vvv" });
  }).catch(err => {
    callback(err);
  });
};

module.exports.buildXlsxFile = ({
                                       sheetName='模型名單',
                                       xlsxDataSet=[[]],
                                       password,
                                       xlsxFileAbsolutePath
                                     }, callback) => {

  Q.nfcall(this.buildXlsxWorkbook, {sheetName, xlsxDataSet}).then(workbook => {
    // Write to file.
    this.exportWorkbookToFile(workbook, {xlsxFileAbsolutePath, password}, callback);
  });
};

module.exports.exportWorkbookToFile = (workbook, {xlsxFileAbsolutePath, password}, callback) => {
  // Write to file.
  workbook.toFileAsync(xlsxFileAbsolutePath, { password: password }).then(() => {
    callback(null, fs.statSync(xlsxFileAbsolutePath));
  }).catch(err => {
    callback(err);
  });
};



module.exports.httpResponseArchiveFile = ({
                                            res,
                                            zipBuffer,
                                            fileName = Date.now()
                                          }) => {
  const zipContentType = 'application/octet-stream';

  res.setHeader('Content-Type', zipContentType);
  res.setHeader('Content-Disposition', `attachment; filename=${fileName}.zip`);
  res.setHeader('Content-Transfer-Encoding', 'binary');
  res.setHeader('Content-Length', zipBuffer.length);

  res.end(new Buffer(zipBuffer, 'binary'));
};

module.exports.downloadRemoteFile = (url, dest, cb) => {
  try {
    fs.unlinkSync(dest);
  } catch (err) {
    winston.warn(`unlink file ${dest} failed: ${err}`);
  }

  let file = fs.createWriteStream(dest);
  let sendReq = request.get(url);

  // verify response code
  sendReq.on('response', function(response) {
    if (response.statusCode !== 200) {
      winston.info(`download remote file: ${dest} response code: ${response.statusCode}`);
      fs.unlink(dest, err => {
        err && winston.warn(`unlink ${dest} failed: ${err}`);
      });
      return cb('Response status was ' + response.statusCode);
    }
  });

  // check for request errors
  sendReq.on('error', function (err) {
    winston.info(`download remote file: ${url} on error: ${err}`);
    fs.unlink(dest, err => {
      err && winston.warn(`unlink ${dest} failed: ${err}`);
    });
    winston.error(`downloadRemoteFile ${url} failed: `, err);
    return cb(err);
  });

  sendReq.pipe(file);

  file.on('finish', function() {
    file.close(cb);  // close() is async, call cb after close completes.
  });

  file.on('error', function(err) { // Handle errors
    winston.info(`write file: ${dest} on error: ${err}`);
    fs.unlink(dest, err => {    // Delete the file async. (But we don't check the result)
      err && winston.warn(`unlink ${dest} failed: ${err}`);
    });
    return cb(err.message);
  });
};

module.exports.archiveFiles = (folder, srcPaths = [], dest, callback) => {
  try {
    fs.unlinkSync(dest);
  } catch (err) {
    winston.warn(`delete file ${dest} failed: ${err}`);
  }
  const archiver = require('archiver');
  const output = fs.createWriteStream(dest);
  const archive = archiver('zip', {
    zlib: { level: 9 } // Sets the compression level.
  });

  output.on('close', function() {
    winston.info(archive.pointer() + ' total bytes');
    winston.info('archiver has been finalized and the output file descriptor has closed.');
    // output.end();
    let fileStat = fs.statSync(dest);
    callback(null, fileStat);
  });

  // good practice to catch this error explicitly
  archive.on('error', function(err) {
    callback(err);
  });

  archive.pipe(output);

  srcPaths.forEach(src => {
    archive.append(fs.createReadStream(path.resolve(folder, src)), { name: path.basename(src) });
  });

  archive.finalize();
};

module.exports.archiveStat = (path, callback) => {
  const yauzl = require('yauzl');
  let entries = [];
  // let fileSize = 0;
  Q.nfcall(fs.stat, path).then(stats => {
    return Q.nfcall(yauzl.open, path, {lazyEntries: false}).then(zipFile => {
      // zipFile.readEntry();
      zipFile.on('entry', entry => {
        entries.push(entry.fileName);
      }).on('end', () => {
        stats.entries = entries;
        callback(null, stats);
      }).on('error', err => {
        callback(err);
      });
    });
  }).fail(err => {
    callback(err);
  });
};