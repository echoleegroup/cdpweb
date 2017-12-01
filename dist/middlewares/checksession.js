"use strict";
const DEFAULT_MAIN_PATH = '/login';

module.exports.checkLogin = (redirect) => {
	return (req, res, next) => {
		console.log('=== middleware check login');
		if(req.session.userid && req.session.userid != '') {
			return next();
		} else {
			return res.redirect(redirect || DEFAULT_MAIN_PATH);
		}
	  };
};
