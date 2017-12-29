'use strict';

const winston = require('winston');
const boom = require('boom');

//const constants = require('../constants');

module.exports = (app) => {
  //hook for web request
 
  app.use('/', require('./action-index')(app));
  app.use('/', require('./action-login')(app));

  app.use('/system', require('./action-user-o')(app));
  app.use('/system', require('./action-user-role-o')(app));

  app.use('/model', require('./action-model-o')(app));
  app.use('/model', require('./action-cust-gene-o')(app));
  app.use('/model', require('./action-cust-obrv-o')(app));
  app.use('/model', require('./action-cust-motivation-o')(app));

  app.use('/target', require('./action-target')(app));
  app.use('/target', require('./action-model-download-o')(app));
  app.use('/target', require('./action-gene-raudic-o')(app));
  app.use('/target', require('./action-ta-dispatch-upload-o')(app));
  app.use('/target', require('./action-ta-reaction-upload-o')(app));
  
  app.use('/actad', require('./action-event-page-o')(app));
  app.use('/actad', require('./action-event-ad-o')(app));
  app.use('/FeedData', require('./action-feed-data-o')(app));
  app.use('/NCBSData', require('./action-ncbs-data-o')(app));
  app.use('/taanarpt_rult', require('./action-taanarpt-rult-o')(app));
  //hook for restful api
  app.use('/api/model', require('./api/api-model')(app));

  // APIs
  //app.use(constants.ENDPOINT_API + '/auth', require('./api/api-auth')(app));

  //app.use('/', require('./action-index')(app));
  //app.use('/status', require('./action-status')(app));
};
