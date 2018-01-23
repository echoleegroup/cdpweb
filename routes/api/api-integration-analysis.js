'use strict'

const express = require('express');
const winston = require('winston');
const Q = require('q');
const _ = require('lodash');
const shortid = require('shortid');
const auth = require("../../middlewares/login-check");
const factory = require("../../middlewares/response-factory");
const criteriaService = require('../../services/custom-target-service');
const codeGroupService = require('../../services/code-group-service');
const exportService = require('../../services/export-service');
const modelService = require('../../services/model-service');
const criteriaHelper = require('../../helpers/criteria-helper');
const fileHelper = require('../../helpers/file-helper');
const middlewares = [factory.ajax_response_factory(), auth.ajaxCheck()];