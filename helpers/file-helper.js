const fs = require('fs');
const _ = require('lodash');
const path = require('path');
const Q = require('q');
const winston = require('winston');
const constants = require("../utils/constants");
const storage = constants.ASSERTS_ABSOLUTE_PATH;

module.exports.sendZipArchivedExcel = ({
                                     res, xlsxDataSet=[[]],
                                     ext='.xlsx',
                                     sheetName='模型名單',
                                     fileName=Date.now(),
                                     password,
                                     logColumnIndex = []}) => {
  const xlsx = require('node-xlsx');
  const Minizip = require('minizip-asm.js');
  //const xlsxContentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';  // For Excel2007 and above .xlsx files
  const zipContentType = 'application/zip';

  let xlsxBuffer = xlsx.build([{name: sheetName, data: xlsxDataSet}]);
  let archiveOptions = {};
  if (password) {
    archiveOptions.password = password
  }

  let mz = new Minizip();
  let zipBuffer = mz.append(`${fileName}.${ext}`, xlsxBuffer, archiveOptions);

  //this is for backup
  fs.writeFile(path.join(storage, `${Date.now()}.${xlsx}`), zipBuffer, {'flag':'w'}).then(() => {  // 如果文件存在，覆盖
    res.setHeader('Content-Type', zipContentType);
    res.setHeader('Content-Disposition', `attachment; filename=${fileName}.zip`);
    res.writeHead(200);
    res.end(zipBuffer);
  });
};