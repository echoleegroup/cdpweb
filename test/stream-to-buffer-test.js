const fs = require('fs');
const winston = require('winston');
const stream = fs.createReadStream('/Users/hd/Documents/project/cdp/S1Taqv6vG/meta');

const streamBuffers = require('stream-buffers');
let myWritableStreamBuffer = new streamBuffers.WritableStreamBuffer();
stream
  .on('data', chunk => {
    myWritableStreamBuffer.write(chunk);
  })
  .on('close', () => {
    winston.info(`meta entry close`);
    let data = myWritableStreamBuffer.getContentsAsString('utf8').replace(/\s/g, '');
    console.log(data)
  })
  .on('error', err => {
    winston.error('entry on error: ', err);
    console.log(err);
  });
