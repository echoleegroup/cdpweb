let crypto = require('crypto'),
  algorithm = 'aes192',
  password = 'aaa';

let fs = require('fs');
let zlib = require('zlib');

// input file
let r = fs.createReadStream('/Users/hd/Documents/project/cdp/S1Taqv6vG/t1.csv');
// zip content
let zip = zlib.createGzip();
// encrypt content
let encrypt = crypto.createCipher(algorithm, password);
// decrypt content
//let decrypt = crypto.createDecipher(algorithm, password)
// unzip content
//let unzip = zlib.createGunzip();
// write file
let w = fs.createWriteStream(__dirname + '/zlib-test.zip');

// zip.on('data', (d) => {
//   console.log('zip data: ', d);
//   encrypt.update(d);
// });

// zip.on('end', () => {
//   console.log('zip end');
//   let d = encrypt.end();
//   console.log(d);
// });

// start pipe
r.pipe(zip).pipe(encrypt).pipe(w);