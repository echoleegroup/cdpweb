const fs = require('fs');
const archiver = require('archiver');
const path = require('path');
const crypto = require('crypto');
const es = require('event-stream');
const zlib = require('zlib');

const input = ['/Users/hd/Documents/project/cdp/S1Taqv6vG/t1.csv', '/Users/hd/Documents/project/cdp/S1Taqv6vG/t2.csv'];

const output = fs.createWriteStream(__dirname + '/stream-merge-test.zip');
const zipper = zlib.createGzip();
const encrypt = crypto.createCipher('aes192', 'aaa');

let streamArray = input.map(path => {
  return fs.createReadStream(path);
});

// es.merge(streamArray).pipe(zipper).pipe(encrypt).pipe(output);
es.merge(streamArray).pipe(zipper).pipe(output);