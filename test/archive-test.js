const Q = require('q');
const winston = require('winston');
const fileHelper = require('../helpers/file-helper');

const input = ['/Users/hd/Documents/project/cdp/S1Taqv6vG/t1.csv', '/Users/hd/Documents/project/cdp/S1Taqv6vG/t2.csv'];

const output = __dirname + '/archive-test.zip';

Q.nfcall(fileHelper.archiveFiles, input, output).then(res => {
  winston.info(res);
}).fail(err => {
  winston.error(err);
});
