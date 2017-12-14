'use strict';

const winston = require('winston');

module.exports = (app) => {
    require('../routes')(app);
};
