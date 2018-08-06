const Q = require('q');
const path = require('path');
const fs = require('fs');

const input = [
  '/Users/hd/Downloads/影像處理簡介之image alignment.pptx',
  '/Users/hd/Downloads/台北米其林2018.pdf',
  '/Users/hd/Downloads/富士康人工智能課程 20170914-1.pdf',
  '/Users/hd/Downloads/1014484-1 (1).jpg',
  '/Users/hd/Downloads/Shizuna.mp4'
];

const archiver = require('archiver');
const Minizip = require('minizip-asm.js');
const archiveOptions = {
  password: 'vvv'
};


const tempPath = "/Users/hd/Downloads/test-temp.zip";
const output = fs.createWriteStream(tempPath);
const archive = archiver('zip', {
  zlib: { level: 9 } // Sets the compression level.
});

output.on('close', function() {
  const mz1 = new Minizip();
  const mz2 = new Minizip(fs.readFileSync(tempPath));
  mz2.list().forEach(info => {
    mz1.append(info.filepath, mz2.extract(info.filepath, archiveOptions), archiveOptions)
  });
  fs.writeFileSync("/Users/hd/Downloads/test-2.zip", new Buffer(mz1.zip()));
  fs.unlinkSync(tempPath);
});

// pipe archive data to the file
archive.pipe(output);
input.forEach(p => {
  archive.append(fs.createReadStream(p), { name: path.basename(p) });
});

archive.finalize();