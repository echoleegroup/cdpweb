'use strict';

const config = require('./config.json');
const configLab = require('./config.lab.json');
const configStaging = require('./config.staging.json');
const configProduction = require('./config.production.json');

module.exports = {
  set: (setting, val) => {
    switch (process.env.STAGE) {
      case 'production':
        configProduction[setting] = val;
        break;
      case 'staging':
        configStaging[setting] = val;
        break;
      case 'lab':
        configLab[setting] = val;
        break;
      default:
        config[setting] = val;
    }
  },
  get: (setting) => {
    switch (process.env.STAGE) {
      case 'production':
        return configProduction[setting];
      case 'staging':
        return configStaging[setting];
      case 'lab':
        return configLab[setting];
      default:
        return config[setting];
    }
  }
};
