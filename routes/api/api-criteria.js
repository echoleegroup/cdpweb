'use strict'

const express = require('express');
const winston = require('winston');
const Q = require('q');
const _ = require('lodash');
const auth = require("../../middlewares/login-check");
const factory = require("../../middlewares/response-factory");
const criteriaService = require('../../services/criteria-service');
const codeGroupService = require('../../services/code-group-service');
const criteriaHelper = require('../../helpers/criteria-helper');
const middlewares = [factory.ajax_response_factory(), auth.ajaxCheck()];

const CUSTOMER_FEATURE_SET_ID = 'ModelGene';
const MODEL_FEATURE_CATEGORY_ID = 'tagene';

module.exports = (app) => {
  winston.info('[api-model] Creating api-model route.');
  const router = express.Router();

  router.get('/history', (req, res) => {
    res.json({
      code: 200,
      data: {},
      message: ''
    });
  });

  /**
   * get available fields (and folds), that user able to set filter criteria.
   * */
  router.get('/:mdId/:batId/target/fields', middlewares, (req, res) => {
    let mdId = req.params.mdId;
    let batId = req.params.batId;
    winston.info('/criteria/fields(mdId=%s, batId=%s)', mdId, batId);

    Q.all([
      Q.nfcall(criteriaService.getModelBatchCategWithCustomFeatures, mdId, batId, MODEL_FEATURE_CATEGORY_ID, CUSTOMER_FEATURE_SET_ID),
      Q.nfcall(criteriaService.getFieldFoldingTree, CUSTOMER_FEATURE_SET_ID)
    ]).spread((rawFields, foldingTree) => {
      // get code group from rawFields
      // ** IMPORTANT: get code group before getCriteriaFields **
      // ** because getCriteriaFields is a mutated function, which move folded fields out of rawFields **
      let refCodeGroups = _.uniq(_.reject(_.map(rawFields, 'codeGroup'), _.isEmpty));
      let fields = criteriaHelper.criteriaFeaturesToFields(rawFields, foldingTree);
      return Q.nfcall(codeGroupService.getSysCodeGroups, refCodeGroups).then(codeGroupResSet => ({
        fields: fields,
        fieldRefs: criteriaHelper.codeGroupToRefFields(codeGroupResSet)
      }));
    }).then(resSet => {
      res.json(resSet);
    }).fail(err => {
      winston.error('===/%s/%s/target/fields internal server error: %j', mdId, batId, err);
      res.json(null, 500, 'internal service error');
    });
  });

  router.get('/history/:id', middlewares, (req, res) => {
    Q.nfcall(criteriaService.getCriteriaHistory, req.params.id).then((criteria) => {
      res.json(criteria);
    }).fail((err) => {
      winston.error('===api-criteria.getCriteriaHistory error: ', err);
    });
  });

  return router;
};