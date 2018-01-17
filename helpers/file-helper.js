const fs = require('fs');
const _ = require('lodash');
const path = require('path');
const Q = require('q');
const winston = require('winston');
const constants = require("../utils/constants");
const storage = constants.ASSERTS_ABSOLUTE_PATH;

module.exports.sendZipArchivedExcel = ({
                                     res, xlsxDataSet=[[]],
                                     ext='xlsx',
                                     sheetName='模型名單',
                                     fileName=Date.now(),
                                     password,
                                     logColumnIndex = []}) => {
  const xlsx = require('node-xlsx');
  const Minizip = require('minizip-asm.js');
  //const xlsxContentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';  // For Excel2007 and above .xlsx files
  const zipContentType = 'application/octet-stream';
  // const zipContentType = 'application/zip';

  let xlsxFileName = `${fileName}.${ext}`;
  let xlsxFileAbsolutePath = path.join(storage, `${xlsxFileName}`);
  let xlsxBuffer = xlsx.build([{name: sheetName, data: xlsxDataSet}]);
  let archiveOptions = {};
  if (password) {
    archiveOptions.password = password;
  }

  let mz = new Minizip();
  mz.append(`${xlsxFileName}`, xlsxBuffer, archiveOptions);
  let zipBuffer = mz.zip();

  //fs.writeFileSync(path.join(storage, `${fileName}.zip`), zipBuffer, {'flag':'w'});

  //this is for backup
  Q.nfcall(fs.writeFile, xlsxFileAbsolutePath , xlsxBuffer, {'flag':'w'}).then(() => {  // 如果文件存在，覆盖
    res.setHeader('Content-Type', zipContentType);
    res.setHeader('Content-Disposition', `attachment; filename=${fileName}.zip`);
    res.setHeader('Content-Transfer-Encoding', 'binary');
    //res.setHeader('Content-Length', zipBuffer.length);
    res.end(new Buffer(zipBuffer, 'binary'));
  }).fail(err => {
    throw err;
  });
};