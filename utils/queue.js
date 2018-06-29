const Q = require('q');
const shortid = require('shortid');
const queue = {};
const orders = [];
const MAX_CONCURRENCE = 2;
let concurrence = 0;

const next = () => {
  if (orders.length > 0 && concurrence.length < MAX_CONCURRENCE) {
    let id = orders.splice(0, 1);
    let process = queue[id];
    delete queue[id];
    concurrence++ && process();
  }
};

module.exports.push = (processor = () => {}, callback = () => {}) => {
  let id = shortid.generate();
  queue[id] = () => {
    Q(processor()).then(data => {
      callback(null, data);
    }).fail(err => {
      callback(error)
    }).finally(() => {
      concurrence--;
      next();
    })
  };
  orders.push(id);

  next();
};