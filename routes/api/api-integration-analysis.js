'use strict'

const express = require('express');
const winston = require('winston');
const Q = require('q');
const _ = require('lodash');
const shortid = require('shortid');
const auth = require("../../middlewares/login-check");
const factory = require("../../middlewares/response-factory");
const integrationService = require('../../services/integration-analysis-service');
const integrationTaskService = require('../../services/integration-analysis-task-service');
const codeGroupService = require('../../services/code-group-service');
const queryService = require('../../services/query-log-service');
const fileHelper = require('../../helpers/file-helper');
const criteriaHelper = require('../../helpers/criteria-helper');
const integratedHelper = require('../../helpers/integrated-analysis-helper');
const constants = require('../../utils/constants');
const MENU_CODE = constants.MENU_CODE;
const middlewares = [factory.ajax_response_factory(), auth.ajaxCheck()];
// const storage = constants.ASSERTS_FOLDER_PATH_ABSOLUTE;
// const multer = require('multer');
// const upload = multer({ dest: storage });

const CLIENT_CRITERIA_FEATURE_SET_ID = 'COMMCUST';
const VEHICLE_CRITERIA_FEATURE_SET_ID = 'COMMCAR';

const INTEGRATION_ANALYSIS_TREE_ID = 'COMM';
const ANONYMOUS_ANALYSIS_TREE_ID = 'OUCOMM';

const CRITERIA_TRANSACTION_SET_ID = 'COMMTARGETSET';
const CRITERIA_TAG_SET_ID = 'TAGTARGETSET_CR';
const EXPORT_DOWNLOAD_FEATURE_SET_ID = 'COMMDNLD';
const EXPORT_RELATIVE_SET_ID = 'COMMDNLDSET';
const ANONYMOUS_TAG_SET_ID = 'TAGTARGETSET_OU';
const ANONYMOUS_EXPORT_DOWNLOAD_FEATURE_SET_ID = 'OUCOMMDNLD';

const criteriaFeaturePromise = (setId, treeId) => {
  return Q.all([
    Q.nfcall(integrationService.getCriteriaFeatures, setId),
    Q.nfcall(integrationService.getCriteriaFeatureTree, treeId)
  ]).spread((features, foldingTree) => {
    // winston.info('criteriaFeaturePromise getCriteriaFeatures: ', features);
    // winston.info('criteriaFeaturePromise getCriteriaFeatureTree: ', foldingTree);
    // get code group from features
    // ** IMPORTANT: get code group before transforming features to tree nodes **
    // ** because featuresToTreeNodes is a mutated function, which move folded fields out of features **
    let refCodeGroups = _.uniq(_.reject(_.map(features, 'codeGroup'), _.isEmpty));
    let fields = criteriaHelper.featuresToTreeNodes(features, foldingTree);
    return Q.nfcall(codeGroupService.getFeatureCodeGroups, refCodeGroups).then(codeGroupResSet => ({
      features: fields,
      featureRefCodeMap: _.groupBy(codeGroupResSet, 'codeGroup')
    }));
  });
};

module.exports = (app) => {
  winston.info('[api-model] Creating api-integration-analysis route.');
  const router = express.Router();

  /**
   * get available features (and folds), that user able to set filter criteria.
   * */
  router.get('/features/criteria/client', middlewares, (req, res) => {
    criteriaFeaturePromise(CLIENT_CRITERIA_FEATURE_SET_ID, INTEGRATION_ANALYSIS_TREE_ID).then(resSet => {
      res.json(resSet);
    }).fail(err => {
      console.log('===/features/criteria/client internal server error: ', err);
      res.json(null, 500, 'internal service error');
    });
  });

  router.get('/features/criteria/vehicle', middlewares, (req, res) => {
    criteriaFeaturePromise(VEHICLE_CRITERIA_FEATURE_SET_ID, INTEGRATION_ANALYSIS_TREE_ID).then(resSet => {
      res.json(resSet);
    }).fail(err => {
      winston.error('===/features/criteria/vehicle internal server error: ', err);
      res.json(null, 500, 'internal service error');
    });
  });

  router.get('/features/criteria/transaction/set/:setId', middlewares, (req, res) => {
    let setId = req.params.setId;
    criteriaFeaturePromise(setId, INTEGRATION_ANALYSIS_TREE_ID).then(resSet => {
      res.json(resSet);
    }).fail(err => {
      winston.error('===/features/criteria/transaction/set/%s internal server error: ', setId, err);
      res.json(null, 500, 'internal service error');
    });
  });

  router.get('/features/criteria/transaction/sets', middlewares, (req, res) => {
    Q.nfcall(integrationService.getFeatureSets, CRITERIA_TRANSACTION_SET_ID).then(resSet => {
      // winston.info('/features/criteria/transaction/sets  getFeatureSets: %j', resSet);
      let nodes = integratedHelper.featureSetsToTreeNodes(resSet);
      // winston.info('/features/criteria/transaction/sets  featureSetsToTreeNodes: ', nodes);
      res.json(nodes);
    }).fail(err => {
      winston.error('===/features/criteria/transaction/sets internal server error: ', err);
      res.json(null, 500, 'internal service error');
    });
  });

  const cr_tag_handler = (setId, keyword) => {
    switch (setId) {
      case 'TagActive':
        return Q.nfcall(integrationService.filterTagActiveSet, keyword);
      case 'TagQtn':
        return Q.nfcall(integrationService.filterTagQtnSet, keyword);
      case 'TagOwnMedia':
        return Q.nfcall(integrationService.filterTagOwnMediaSet, keyword);
      case 'TagEInterest':
        return Q.nfcall(integrationService.filterTagEInterestSet, keyword);
      case 'TagEIntent':
        return Q.nfcall(integrationService.filterTagEIntentSet, keyword);
      case 'TagOuterMedia':
        return Q.nfcall(integrationService.filterTagOuterMediaSet, keyword);
      default:
        return Q();
    }
  };

  router.post('/features/criteria/tag/set/:setId', middlewares, (req, res) => {
    let setId = req.params.setId;
    let keyword = req.body.keyword || '';
    let promise = cr_tag_handler(setId, keyword);

    promise.then(resSet => {
      // winston.info('resSet: ', resSet);
      let nodes = integratedHelper.featureSetsToTreeNodes(resSet);
      res.json(nodes);
    }).fail(err => {
      winston.error('===/features/criteria/transaction/sets internal server error: ', err);
      res.json(null, 500, 'internal service error');
    });

    // Q.nfcall(integrationService.filterCriteriaFeatures, setId, keyword).then(resSet => {
    //   let nodes = integratedHelper.featureSetsToTreeNodes(resSet);
    //   res.json(nodes);
    // }).fail(err => {
    //   winston.error('===/features/criteria/transaction/sets internal server error: ', err);
    //   res.json(null, 500, 'internal service error');
    // });
  });

  router.get('/features/criteria/tag/sets', middlewares, (req, res) => {
    Q.nfcall(integrationService.getFeatureSets, CRITERIA_TAG_SET_ID).then(resSet => {
      // winston.info('/features/criteria/tag/sets  getFeatureSets: %j', resSet);
      let nodes = criteriaHelper.datasetToNodes(resSet);
      // winston.info('/features/criteria/tag/sets  featureSetsToTreeNodes: ', nodes);
      res.json(nodes);
    }).fail(err => {
      winston.error('===/features/criteria/tag/sets internal server error: ', err);
      res.json(null, 500, 'internal service error');
    });
  });

  router.get('/export/features', middlewares, (req, res) => {
    Q.all([
      Q.nfcall(integrationService.getDownloadFeatures, EXPORT_DOWNLOAD_FEATURE_SET_ID),
      Q.nfcall(integrationService.getCriteriaFeatureTree, INTEGRATION_ANALYSIS_TREE_ID)
    ]).spread((features, foldingTree) => {
      // winston.info('/export/features getCriteriaFeatures: ', features);
      // winston.info('/export/features getCriteriaFeatureTree: ', foldingTree);
      let fields = criteriaHelper.featuresToTreeNodes(features, foldingTree);
      res.json(fields);
    }).fail(err => {
      winston.error('===/export/features internal server error: ', err);
      res.json(null, 500, 'internal service error');
    });
  });

  router.get('/export/relative/sets', middlewares, (req, res) => {
    Q.nfcall(integrationService.getFeatureSets, EXPORT_RELATIVE_SET_ID).then(resSet => {
      res.json(criteriaHelper.datasetToNodes(resSet));
    }).fail(err => {
      winston.error('===/export/relative/sets internal server error: ', err);
      res.json(null, 500, 'internal service error');
    });
  });

  router.post('/export/query', middlewares, (req, res) => {
    let criteria = req.body.criteria;
    let expt = req.body.export;
    let filter = req.body.filter;

    // winston.info(req.body.export);

    let promises = _.map(expt.relatives, relativeSetId => {
      return Q.all([
        Q.nfcall(integrationService.getFeatureSet, EXPORT_RELATIVE_SET_ID, relativeSetId),
        Q.nfcall(integrationService.getDownloadFeatures, relativeSetId)
      ]).spread((featureSet, features) => {
        return {
          [relativeSetId]: {
            features: _.map(features, 'featID'),
            filter: _.assign({
              feature: featureSet.periodCriteriaFeatID
            }, filter.relatives)
          }
        }
      });
    });

    promises.splice(0, 0,
      Q.nfcall(queryService.insertQueryLog , {
        menuCode: MENU_CODE.INTEGRATED_QUERY,
        criteria: JSON.stringify(criteria),
        features: JSON.stringify(expt),
        filters: JSON.stringify(filter),
        updUser: req.user.userId
      }).then(insertRes => {
        return Q.nfcall(integrationTaskService.initQueryTask, insertRes.queryID, req.user.userId)
      }));

    Q.all(promises).then(([insertLog, ...results]) => {
      // winston.info('insertLog: ', insertLog);
      // winston.info('results: %j', results);
      let relatives = _.assign({}, ...results);
      let backendCriteriaData = {
        criteria: criteria,
        export: {
          master: {
            features: expt.master,
            filter: {}
          },
          relatives: relatives
        }
      };

      return Q.all([
        backendCriteriaData,
        insertLog.queryID,
        Q.nfcall(queryService.updateQueryLogProcessingData, insertLog.queryID, JSON.stringify(backendCriteriaData))
      ]);
    }).spread((backendCriteriaData, queryId, ...results) => {
      // winston.info('queryId: %s', queryId);
      // winston.info('backendCriteriaData: %j', backendCriteriaData);
      const integratedAnalysisTransService = require('../../services/trans-360backand-service');
      return Q.all([
        queryId,
        Q.nfcall(integratedAnalysisTransService.transService, queryId, backendCriteriaData)
          .fail(err => {
            Q.nfcall(integrationTaskService.setQueryTaskStatusRemoteServiceUnavailable, queryId);
            throw err;
          })]);
    }).spread((queryId, queryScript) => {
      Q.nfcall(integrationTaskService.setQueryTaskStatusProcessing, queryId, JSON.stringify(queryScript));

      res.json({queryId});
    }).fail(err => {
      winston.error(`===/export/query internal server error: ${err}`);
      console.log(err);
      res.json(null, 500, 'internal service error');
    });
  });

  router.get('/export/query/:queryId', middlewares, (req, res) => {
    let queryId = req.params.queryId;
    Q.nfcall(integrationTaskService.getQueryTask, queryId).then(queryTask => {
      if (!queryTask) {
        return res.json(null, 301, 'task not found!');
      }
      queryTask.archiveSizeInBytes = queryTask.archiveSizeInBytes * 1;
      queryTask.archiveEntries = (queryTask.archiveEntries)? JSON.parse(queryTask.archiveEntries): [];
      queryTask.criteria = (queryTask.criteria)? JSON.parse(queryTask.criteria): [];
      res.json(queryTask, 200);
    }).fail(err => {
      res.json(null, 500, 'internal service error!');
    });
  });

  router.get('/export/download/:queryId', middlewares, (req, res) => {
    // const fs = require('fs');
    let queryId = req.params.queryId;
    let fileName = `${queryId}.zip`;
    let filePath = `${constants.ASSERTS_SPARK_INTEGRATED_ANALYSIS_ASSERTS_PATH_ABSOLUTE}/${fileName}`;

    Q.nfcall(queryService.insertDownloadLog, {
      queryId,
      filePath,
      userId: req.user.userId
    }).then(() => {
      let deferred = Q.defer();
      res.download(filePath, fileName, err => {
        if (err) deferred.reject(err);
        else deferred.resolve();
      });
      return deferred.promise;
    }).fail(err => {
      console.log(err);
      res.json(null, 500, 'internal service error!');
    });
  });

  router.get('/anonymous/features/criteria/tag/sets', middlewares, (req, res) => {
    Q.nfcall(integrationService.getFeatureSets, ANONYMOUS_TAG_SET_ID).then(resSet => {
      // winston.info('/features/criteria/tag/sets  getFeatureSets: %j', resSet);
      let nodes = criteriaHelper.datasetToNodes(resSet);
      // winston.info('/features/criteria/tag/sets  featureSetsToTreeNodes: ', nodes);
      res.json(nodes);
    }).fail(err => {
      winston.error('===/features/criteria/tag/sets internal server error: ', err);
      res.json(null, 500, 'internal service error');
    });
  });

  router.get('/anonymous/export/features', middlewares, (req, res) => {
    Q.all([
      Q.nfcall(integrationService.getDownloadFeatures, ANONYMOUS_EXPORT_DOWNLOAD_FEATURE_SET_ID),
      Q.nfcall(integrationService.getCriteriaFeatureTree, ANONYMOUS_ANALYSIS_TREE_ID)
    ]).spread((features, foldingTree) => {
      // winston.info('/export/features getCriteriaFeatures: ', features);
      // winston.info('/export/features getCriteriaFeatureTree: ', foldingTree);
      let fields = criteriaHelper.featuresToTreeNodes(features, foldingTree);
      res.json(fields);
    }).fail(err => {
      winston.error('===/export/features internal server error: ', err);
      res.json(null, 500, 'internal service error');
    });
  });

  router.post('/anonymous/export/query', middlewares, (req, res) => {
    let criteria = req.body.criteria;
    let expt = req.body.export;
    let filter = req.body.filter;

    // winston.info(req.body.export);

    Q.nfcall(queryService.insertQueryLog , {
      menuCode: MENU_CODE.INTEGRATED_QUERY,
      criteria: JSON.stringify(criteria),
      features: JSON.stringify(expt),
      filters: JSON.stringify(filter),
      updUser: req.user.userId
    }).then(insertRes => {
      return Q.nfcall(integrationTaskService.initQueryTask, insertRes.queryID, req.user.userId)
    }).then(insertLog => {
      // winston.info('insertLog: ', insertLog);
      // winston.info('results: %j', results);
      let relatives = {};
      let backendCriteriaData = {
        criteria: criteria,
        export: {
          master: {
            features: expt.master,
            filter: {}
          },
          relatives: relatives
        }
      };

      return Q.all([
        backendCriteriaData,
        insertLog.queryID,
        Q.nfcall(queryService.updateQueryLogProcessingData, insertLog.queryID, JSON.stringify(backendCriteriaData))
      ]);
    }).spread((backendCriteriaData, queryId, ...results) => {
      // winston.info('queryId: %s', queryId);
      // winston.info('backendCriteriaData: %j', backendCriteriaData);
      const integratedAnalysisTransService = require('../../services/spark-api-log-service');
      return Q.all([
        queryId,
        Q.nfcall(integratedAnalysisTransService.transService, queryId, backendCriteriaData)
          .fail(err => {
            Q.nfcall(integrationTaskService.setQueryTaskStatusRemoteServiceUnavailable, queryId);
            throw err;
          })]);
    }).spread((queryId, queryScript) => {
      Q.nfcall(integrationTaskService.setQueryTaskStatusProcessing, queryId, JSON.stringify(queryScript));

      res.json({queryId});
    }).fail(err => {
      winston.error(`===/export/query internal server error: ${err}`);
      console.log(err);
      res.json(null, 500, 'internal service error');
    });
  });

  return router;
};