const fs = require('fs');
const _ = require('lodash');
const path = require('path');
const Q = require('q');
const winston = require('winston');
const constants = require("../utils/constants");
const storage = constants.ASSERTS_ABSOLUTE_PATH;

module.exports.buildXlsxBuffer = ({
                                    sheetName='模型名單',
                                    xlsxDataSet=[[]]
                                  }) => {
  const xlsx = require('node-xlsx');
  return xlsx.build([{name: sheetName, data: xlsxDataSet}]);
};

module.exports.buildXlsxFile = ({
                                  sheetName='模型名單',
                                  xlsxDataSet=[[]],
                                  xlsxFileAbsolutePath
                                }, callback) => {

  let buffer = this.buildXlsxBuffer({sheetName, xlsxDataSet});

  Q.nfcall(fs.writeFile, xlsxFileAbsolutePath , buffer, {'flag':'w'}).then(res => {
    callback(null, buffer);
  }).fail(err => {
    callback(err, null);
  });
};

module.exports.buildZipBuffer = ({
                                   path: [],
                                   buff: [],
                                   password
                                 }) => {
  const Minizip = require('minizip-asm.js');

  let archiveOptions = {};
  if (password) {
    archiveOptions.password = password;
  }

  let mz = new Minizip();
  for (let i in path) {
    mz.append(path[i], buff[i], archiveOptions);
  }
  return mz.zip();
};





module.exports.httpResponseArchiveFile = ({
                                            res,
                                            path: [],
                                            buff: [],
                                            password
                                          }) => {
  const zipContentType = 'application/octet-stream';

  let zipBuffer = this.buildZipBuffer({path, buff, password});

  res.setHeader('Content-Type', zipContentType);
  res.setHeader('Content-Disposition', `attachment; filename=${fileName}.zip`);
  res.setHeader('Content-Transfer-Encoding', 'binary');
  res.setHeader('Content-Length', zipBuffer.length);

  res.end(new Buffer(zipBuffer, 'binary'));
};