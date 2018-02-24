'use strict'
const boom = require('boom');
const winston = require('winston');
const DEFAULT_LOGIN_PATH = '/login';
const DEFAULT_HOME_PATH = '/home';

module.exports.check = (redirect) => {
  return (req, res, next) => {
    if (req.isAuthenticated()) {
      return next();
    } else {
      return res.redirect(redirect || DEFAULT_LOGIN_PATH);
    }
  };
};

module.exports.ajaxCheck = () => {
  return (req, res, next) => {
    if (req.isAuthenticated()) {
      return next();
    }
    next(boom.unauthorized('Not Logged In'));
  };
};

module.exports.checkDownloadPermission = (menuCode) => {
  return (req, res, next) => {
    winston.info('=== middleware check DownloadPermission');
    if (req.session.permission[menuCode] && req.session.permission[menuCode].download) {
      return next();
    } else {
      return res.redirect(DEFAULT_HOME_PATH);
    }
  };
};

module.exports.checkViewPermission = (menuCode) => {
  return (req, res, next) => {
    winston.info('=== middleware check ViewPermission');
    if (req.session.permission[menuCode] && req.session.permission[menuCode].read) {
      return next();
    } else {
      return res.redirect(DEFAULT_HOME_PATH);
    }
  };
};

module.exports.checkEditPermission = (menuCode) => {
  return (req, res, next) => {
    winston.info('=== middleware check EditPermission');
    if (req.session.permission[menuCode] && req.session.permission[menuCode].edit) {
      return next();
    } else {
      return res.redirect(DEFAULT_HOME_PATH);
    }
  };
};

module.exports.checkInternalFileUploadPermission = () => {
  return (req, res, next) => {
    let username = req.body.username;
    let password = req.body.password;
    if (process.env.FTP_AUTH_USERNAME !== username || process.env.FTP_AUTH_PASS !== password) {
      winston.warn(`===${req.originalUrl} checkInternalFileUploadPermission: invalid`);
      return res.json(null, 401, 'access denied');
    }
    return next();
  };
};