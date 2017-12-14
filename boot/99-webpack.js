'use strict';

const winston = require('winston');

module.exports = (app) => {
	if ('TEST' === process.env.RUNTIME) {
		return;
	}

	if ('production' !== process.env.NODE_ENV) {
        const webpack = require('webpack');

		let config = require('../webpack.config');
		let compiler = webpack(config);

		app.use(require("webpack-dev-middleware")(compiler, {
			noInfo: true,
			stats: {
				colors: true
			},
			publicPath: config.output.publicPath
		}));
		app.use(require("webpack-hot-middleware")(compiler));

		winston.info('=== Webpack Hot Reloading ENABLED');
	}
};
