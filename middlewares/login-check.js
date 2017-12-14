"use strict";
const boom = require('boom');
const DEFAULT_MAIN_PATH = '/login';

module.exports.checkLogin = (redirect) => {
	return (req, res, next) => {
		if(req.session.userid && req.session.userid != '') {
			return next();
		} else {
			return res.redirect(redirect || DEFAULT_MAIN_PATH);
		}
	  };
};

module.exports.ajaxCheck = () => {
	return (req, res, next) => {
	  if (req.session.userid && req.session.userid != '') {
		return next();
	  }
  
	  next(boom.forbidden('Not Logged In'));
	};
  };