const fileHelper = require('../helpers/file-helper');
const srcUrl = 'http://www.masters.tw/wp-content/uploads/2017/12/nokia.jpg';
const destPath = __dirname + '/remote-file-download.zip';
const Q = require('q');
const winston = require('winston');

Q.nfcall(fileHelper.downloadRemoteFile, srcUrl, destPath).then((res) => {
  winston.info('downloadRemoteFile: ', res);

}).fail(err => {
  winston.error(err);
});