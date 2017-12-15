'use strict';

const winston = require('winston');
const boom = require('boom');

//const constants = require('../constants');

module.exports = (app) => {
  //hook for web request
  app.use('/target', require('./action-target')(app));
  app.use('/', require('./action-index')(app));
  app.use('/', require('./action-login')(app));
  app.use('/user', require('./action-user-o')(app));
  app.use('/userRole', require('./action-user-role-o')(app));
  app.use('/model', require('./action-model-o')(app));
  app.use('/custGene', require('./action-cust-gene-o')(app));
  app.use('/custobrv', require('./action-cust-obrv-o')(app));
  app.use('/custMotivation', require('./action-cust-motivation-o')(app));
  app.use('/modelDownload', require('./action-model-download-o')(app));
  app.use('/generaudic', require('./action-gene-raudic-o')(app));
  app.use('/talist_putupload', require('./action-ta-dispatch-upload-o')(app));
  app.use('/talist_rspupload', require('./action-ta-reaction-upload-o')(app));
  app.use('/Evtpg', require('./action-event-page-o')(app));
  app.use('/Evtad', require('./action-event-ad-o')(app));
  app.use('/FeedData', require('./action-feed-data-o')(app));
  app.use('/NCBSData', require('./action-ncbs-data-o')(app));
  //hook for restful api
  app.use('/api/model', require('./api-model')(app));

  //route not found
  app.use((req, res) => {
    res.status(404).send('Not Found');
  });
  //error handler
  app.use((error, req, res, next) => {
    if (error.isBoom) return res.status(error.output.statusCode).send(error.message);
    next(error);
  });

  // APIs
  //app.use(constants.ENDPOINT_API + '/auth', require('./api/api-auth')(app));

  //app.use('/', require('./action-index')(app));
  //app.use('/status', require('./action-status')(app));
};
