"use strict";
const boom = require('boom');
const DEFAULT_MAIN_PATH = '/login';

module.exports.checkLogin = (redirect) => {
	return (req, res, next) => {
		if (req.session.userid && req.session.userid != '') {
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

module.exports.checkDownloadPermission = (menuCode) => {
	return (req, res, next) => {
		console.log('=== middleware check DownloadPermission');
		if( req.session.permission[menuCode] && req.session.permission[menuCode].download ) {
			return next();
		} else {
			return res.redirect("/");
		}
	};
};

module.exports.checkViewPermission = (menuCode) => {
	return (req, res, next) => {
		console.log('=== middleware check ViewPermission');
		if( req.session.permission[menuCode] && req.session.permission[menuCode].read ) {
			return next();
		} else {
			return res.redirect("/");
		}
	};
};

module.exports.checkEditPermission = (menuCode) => {
	return (req, res, next) => {
		console.log('=== middleware check EditPermission');
		if( req.session.permission[menuCode] && req.session.permission[menuCode].edit ) {
			return next();
		} else {
			return res.redirect("/");
		}
	};
};