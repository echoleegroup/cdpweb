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

  app.use('/feeddata', require('./action-feed-data-o')(app));
  app.use('/feeddata', require('./action-ncbs-data-o')(app));

  app.use('/taanarpt_rult', require('./action-taanarpt-rult-o')(app));
  //顧客數據導出
  app.use('/integration', require('./action-integration')(app));
  //hook for restful api
  app.use('/api/model', require('./api/api-model')(app));
  app.use('/api/target', require('./api/api-custom-target')(app));
  app.use('/api/integration', require('./api/api-integration-analysis')(app));
  app.use('/api/intra/integration', require('./api/api-integration-analysis-intra')(app));
  app.use('/api/intra/task/log', require('./api/api-task-log-intra')(app));

  //hook for test
  app.use('/api/intra/test', require('../test/api-intra-test')(app));

  // APIs
  //app.use(constants.ENDPOINT_API + '/auth', require('./api/api-auth')(app));

  //app.use('/', require('./action-index')(app));
  //app.use('/status', require('./action-status')(app));
};
