'use strict'

const express = require('express');
const winston = require('winston');
const Q = require('q');
const _ = require('lodash');
const shortid = require('shortid');
const auth = require("../../middlewares/login-check");
const factory = require("../../middlewares/response-factory");
const integrationService = require('../../services/integration-analysis-service');
const codeGroupService = require('../../services/code-group-service');
const criteriaHelper = require('../../helpers/criteria-helper');
const integratedHelper = require('../../helpers/integrated-analysis-helper');
const middlewares = [factory.ajax_response_factory(), auth.ajaxCheck()];

const CLIENT_CRITERIA_FEATURE_SET_ID = 'COMMCUST';
const VEHICLE_CRITERIA_FEATURE_SET_ID = 'COMMCAR';

const INTEGRATION_ANALYSIS_TREE_ID = 'COMM';

const TRANSACTION_SET_ID = 'COMMTARGETSET';

const criteriaFeaturePromise = (setId, treeId) => {
  return Q.all([
    Q.nfcall(integrationService.getCriteriaFeatures, setId),
    Q.nfcall(integrationService.getCriteriaFeatureTree, treeId)
  ]).spread((features, foldingTree) => {
    winston.info('getCriteriaFeatures: ', features);
    winston.info('getCriteriaFeatureTree: ', foldingTree);
    // get code group from features
    // ** IMPORTANT: get code group before transforming features to tree nodes **
    // ** because featuresToTreeNodes is a mutated function, which move folded fields out of features **
    let refCodeGroups = _.uniq(_.reject(_.map(features, 'codeGroup'), _.isEmpty));
    let fields = criteriaHelper.featuresToTreeNodes(features, foldingTree);
    return Q.nfcall(codeGroupService.getFeatureCodeGroups, refCodeGroups).then(codeGroupResSet => ({
      features: fields,
      featureRefCodeMap: criteriaHelper.codeGroupToFeatureRef(codeGroupResSet)
    }));
  });
};

module.exports = (app) => {
  winston.info('[api-model] Creating api-integration-analysis route.');
  const router = express.Router();

  /**
   * get available features (and folds), that user able to set filter criteria.
   * */
  router.get('/client/criteria/features', middlewares, (req, res) => {
    criteriaFeaturePromise(CLIENT_CRITERIA_FEATURE_SET_ID, INTEGRATION_ANALYSIS_TREE_ID).then(resSet => {
      res.json(resSet);
    }).fail(err => {
      winston.error('===/client/criteria/features internal server error: ', err);
      res.json(null, 500, 'internal service error');
    });
  });

  router.get('/vehicle/criteria/features', middlewares, (req, res) => {
    criteriaFeaturePromise(VEHICLE_CRITERIA_FEATURE_SET_ID, INTEGRATION_ANALYSIS_TREE_ID).then(resSet => {
      res.json(resSet);
    }).fail(err => {
      winston.error('===/vehicle/criteria/features internal server error: ', err);
      res.json(null, 500, 'internal service error');
    });
  });

  router.get('/transaction/criteria/features/:setId', middlewares, (req, res) => {
    let setId = req.params.setId;
    criteriaFeaturePromise(setId, INTEGRATION_ANALYSIS_TREE_ID).then(resSet => {
      res.json(resSet);
    }).fail(err => {
      winston.error('===/transaction/criteria/features/%s internal server error: ', setId, err);
      res.json(null, 500, 'internal service error');
    });
  });

  router.get('/transaction/feature/sets', middlewares, (req, res) => {
    Q.nfcall(integrationService.getFeatureSets, TRANSACTION_SET_ID).then(resSet => {
      winston.info('/transaction/feature/sets  getFeatureSets: %j', resSet);
      let nodes = integratedHelper.featureSetsToTreeNodes(resSet);
      winston.info('/transaction/feature/sets  featureSetsToTreeNodes: ', nodes);
      res.json(nodes);
    }).fail(err => {
      winston.error('===/transaction/feature/sets internal server error: ', err);
      res.json(null, 500, 'internal service error');
    });
  });

  return router;
};