'use strict';

const winston = require('winston');
const boom = require('boom');

//const constants = require('../constants');

module.exports = (app) => {

  //route not found
  app.use((req, res) => {
    res.status(404).send('Not Found');
  });
  //error handler
  app.use((error, req, res, next) => {
    winston.info('error handler');
    if (error.isBoom) return res.status(error.output.statusCode).send(error.message);
    next(error);
  });

  return null;

  // APIs
  //app.use(constants.ENDPOINT_API + '/auth', require('./api/api-auth')(app));

  //app.use('/', require('./action-index')(app));
  //app.use('/status', require('./action-status')(app));
};
