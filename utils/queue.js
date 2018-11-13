const Q = require('q');
const _ = require('lodash');
const shortid = require('shortid');
const winston = require('winston');
const integrationTaskService = require('../services/integration-analysis-task-service');
// const queue = {};
// const orders = [];
// const MAX_CONCURRENCE = 2;
// const concurrence = [];

// const next = () => {
//   winston.info('remain tasks: ', orders.length);
//   winston.info('concurrent tasks: ', concurrence.length);
//   winston.info('max concurrent tasks: ', MAX_CONCURRENCE);
//   if (orders.length > 0 && concurrence.length < MAX_CONCURRENCE) {
//     let id = orders.splice(0, 1);
//     concurrence.push(id);
//     let process = queue[id];
//     winston.info(`task ${id} is fetched`);
//     queue[id] = undefined;
//     process().finally(() => {
//       winston.info(`task ${id} finished`);
//       concurrence.splice(concurrence.indexOf(id), 1);
//       next();
//     });
//   }
// };
//
// module.exports.push = (id, processor = () => {}, callback = () => {}) => {
//   id = id || shortid.generate();
//   queue[id] = () => {
//     return Q(processor()).then(data => {
//       callback(null, data);
//     }).fail(err => {
//       callback(error)
//     });
//   };
//   orders.push(id);
//   winston.info(`task ${id} is pushed to queue`);
//
//   next();
// };

class Queue {
  constructor(topic, concurrence=2, suspended=false, auto_start=true) {
    this.queue = [];
    this.processing = [];
    this.topic = topic;
    this.concurrence = concurrence;
    this.suspended = suspended;
    this.auto_start = auto_start;
  };

  push(id = shortid.generate(), processor, callback = () => {}) {
    // id = id || shortid.generate();
    const handler = () => {
      return Q(processor()).then(data => {
        callback(null, data);
      }).fail(err => {
        callback(error)
      });
    };

    this.queue.push({id, handler});

    winston.info(`task ${id} is pushed to topic ${this.topic}`);

    this.auto_start && this.next();
  };

  async next() {
    let head = _.head(this.queue);
    if (head && !this.suspended && this.processing.length >= 0 &&
      this.processing.length < this.concurrence && await this.isNext()) {


      this.processing.push(_.remove(this.queue, {id: head.id}));

      let id = head.id;
      let handler = head.handler;
      winston.info(`task ${id} is fetched from topic ${this.topic}`);

      handler().finally(() => {
        winston.info(`task ${id} finished in topic ${this.topic}`);
        _.remove(this.processing, {id});
        // concurrence.splice(concurrence.indexOf(id), 1);
        this.auto_start && this.next();
      });
    }
  };

  async isNext() {
    return Promise.resolve(true);
  };

  suspend() {
    this.suspended = true;
  };

  resume() {
    this.suspended = false;
    this.auto_start && this.next();
  };
}

class IQTriggerQueue extends Queue {
  async isNext() {
    let result = await this.getRemoteProcessingTaskCount();
    return (result > 0);
  }

  async getRemoteProcessingTaskCount() {
    return new Promise((resolve, reject) => {
      Q.nfcall(integrationTaskService.getTasksByStatus, integrationTaskService.PROCESS_STATUS.REMOTE_PROCESSING)
        .then(res => {
          resolve(res.length);
        }).fail(err => {
          reject(err);
      });
    });
  }
}

const TOPIC = {
  INTEGRATED_QUERY_PARSER: 'integrated_query_parser',
  INTEGRATED_REMOTE_CHECKER: 'integrated_remote_checker',
  INTEGRATED_QUERY_TRIGGER: 'integrated_query_trigger'
};

const _queue = {
  [TOPIC.INTEGRATED_QUERY_PARSER]: new Queue(TOPIC.INTEGRATED_QUERY_PARSER, 2),
  [TOPIC.INTEGRATED_REMOTE_CHECKER]: new Queue(TOPIC.INTEGRATED_REMOTE_CHECKER, 2),
  [TOPIC.INTEGRATED_QUERY_TRIGGER]: new IQTriggerQueue(TOPIC.INTEGRATED_QUERY_TRIGGER, 1)
};

module.exports = {
  TOPIC,
  get: (topic) => {
    return _queue[topic];
  }
};