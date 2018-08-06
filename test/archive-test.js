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
const tr46 = require('tr46');
const archiveOptions = {
  password: 'vvv'
};

const mz = new Minizip();
input.forEach(p => {
  mz.append(tr46.toUnicode(path.basename(p)).domain, fs.readFileSync(p), archiveOptions);
});
fs.writeFileSync("/Users/hd/Downloads/test-1.zip", new Buffer(mz.zip()));
