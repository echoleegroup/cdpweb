'use strict';

const fs = require('fs');
const path = require('path');
const _ = require('lodash');
const winston = require('winston');
const webpack = require("webpack");

//const pluginConfig = require('./plugin-config');

const hotMiddlewareScript = 'webpack-hot-middleware/client?path=/__webpack_hmr&timeout=20000&reload=true';

let webpackEntries = {
  'react.bundle': ['./client/src/Portal.js']
  //'react.bundle.custom.search': ['./client/src/CustomTargetFilterHome.js']
};
let webpackIncludes = [path.join(__dirname, 'client/src')];
/*
const enabledModulePlugins = pluginConfig.filter((p) => {
    return p.enable;
});
enabledModulePlugins.map((p) => {
    const componentPath = p.packagePath + '/client/src/' + p.rootComponentName + '.js';
    if (fs.existsSync(componentPath)) {
        webpackEntries[p.rootComponentName] = [componentPath];
        webpackIncludes.push(p.packagePath + '/client/src');
    }
});
*/
winston.info('=== webpackEntries: %j', webpackEntries);
winston.info('=== webpackIncludes: %j', webpackIncludes);

let webpackPlugins;
if ('production' === process.env.NODE_ENV) {
  webpackPlugins = [
    new webpack.optimize.DedupePlugin(),
    new webpack.optimize.AggressiveMergingPlugin(),
    new webpack.DefinePlugin({'process.env': {NODE_ENV: JSON.stringify(process.env.NODE_ENV)}})
  ];
} else {
  _(webpackEntries).forEach((entry, key) => {
    entry.push(hotMiddlewareScript);
  });
  webpackPlugins = [
    new webpack.NamedModulesPlugin(),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoEmitOnErrorsPlugin()
  ];
}

module.exports = {
  entry: webpackEntries,
  stats: 'minimal',
  plugins: webpackPlugins,
  output: {
    path: path.join(__dirname, 'client/public/!js/'),
    publicPath: '/!js/',
    filename: '[name].js',
  },
  module: {
    loaders: [
      {
        test: /\.css$/,
        loader: "style-loader!css-loader"
      },
      {
        test: /\.jsx?$/,
        loader: 'babel-loader',
        include: webpackIncludes,
        exclude: /node_modules/
      },
      {
        test: /\.hbs$/,
        loader: 'handlebars-loader'
      }
    ]
  },
  resolve: {
    extensions: ['.js', '.jsx']
  }
};