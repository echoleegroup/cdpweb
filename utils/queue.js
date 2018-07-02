const Q = require('q');
const shortid = require('shortid');
const winston = require('winston');
const queue = {};
const orders = [];
const MAX_CONCURRENCE = 2;
const concurrence = [];

const next = () => {
  winston.info('remain tasks: ', orders.length);
  winston.info('concurrent tasks: ', concurrence.length);
  winston.info('max concurrent tasks: ', MAX_CONCURRENCE);
  if (orders.length > 0 && concurrence.length < MAX_CONCURRENCE) {
    let id = orders.splice(0, 1);
    concurrence.push(id);
    let process = queue[id];
    winston.info(`task ${id} is fetched`);
    queue[id] = undefined;
    process().finally(() => {
      winston.info(`task ${id} finished`);
      concurrence.splice(concurrence.indexOf(id), 1);
      next();
    });
  }
};

module.exports.push = (id, processor = () => {}, callback = () => {}) => {
  id = id || shortid.generate();
  queue[id] = () => {
    return Q(processor()).then(data => {
      callback(null, data);
    }).fail(err => {
      callback(error)
    });
  };
  orders.push(id);
  winston.info(`task ${id} is pushed to queue`);

  next();
};