const tar = require('tar-stream');
const zlib = require('zlib');
const fs = require('fs');
const path = require('path');

const input = ['/Users/hd/Documents/project/cdp/S1Taqv6vG/t1.csv', '/Users/hd/Documents/project/cdp/S1Taqv6vG/t2.csv'];
const output = fs.createWriteStream(__dirname + '/archive-tar-test.tar');

const pack = tar.pack(); // pack is a streams2 stream

// add a file called my-stream-test.txt from a stream
let entry = pack.entry({ name: path.basename(input[0]) }, function(err) {
  console.log(err);
  // the stream was added
  // no more entries
  pack.finalize()
});

// entry.on('close', () => {
//   console.log('entry end');
//   entry.end();
// });

fs.createReadStream(input[0]).pipe(entry);



// input.forEach(src => {
//   fs.createReadStream(src).pipe(pack.entry({name: path.basename(src)}, err => {
//     pack.finalize();
//   }))
// });

pack.pipe(output);