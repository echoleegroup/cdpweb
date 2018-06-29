const Q = require('q');
const shortid = require('shortid');
const queue = [];
let running = null;

const next = () => {
  if (!running && queue.length > 0) {
    running = queue.splice(0, 1);
    running();
  }
};

module.exports.push = (processor = () => {}, callback = () => {}) => {
  queue.push(() => {
    Q(processor()).then(data => {
      callback(null, data);
    }).fail(err => {
      callback(error)
    }).finally(() => {
      running = null;
      next();
    })
  });

  next();
};