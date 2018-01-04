'use strict';

const winston = require('winston');

module.exports = {
  up: (query, DataTypes) => {
    return query.dropTable(
      'ugrp_test', {}
    );
  }
};
