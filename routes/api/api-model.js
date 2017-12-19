'user strict'

const express = require('express');
const winston = require('winston');

module.exports = (app) => {
  console.log('[api-model] Creating api-model route.');
  const router = express.Router();

  router.get('/', (req, res) => {
    res.json({
      code: 200,
      data: {},
      message: ''
    });
  });

  return router;
};