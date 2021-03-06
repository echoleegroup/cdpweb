'use strict'

const express = require('express');
const fs = require('fs');
const winston = require('winston');
const Q = require('q');
const _ = require('lodash');
const moment = require('moment');
const auth = require("../../middlewares/login-check");
const factory = require("../../middlewares/response-factory");
const integrationService = require('../../services/integration-analysis-service');
const integrationTaskService = require('../../services/integration-analysis-task-service');
const integrationStatisticService = require('../../services/integration-analysis-statistic-service');
// const codeGroupService = require('../../services/code-group-service');
const queue = require('../../utils/queue');
const queryLogService = require('../../services/query-log-service');
const integratedHelper = require('../../helpers/integrated-analysis-helper');
const codeGroupHelper = require('../../helpers/code-group-helper');
const criteriaHelper = require('../../helpers/criteria-helper');
const constants = require('../../utils/constants');
const MENU_CODE = constants.MENU_CODE;
const INTEGRATED_MODE = constants.INTEGRATED_MODE;
const middlewares = [factory.ajax_response_factory(), auth.ajaxCheck()];
// const storage = constants.ASSERTS_FOLDER_PATH_ABSOLUTE;
// const multer = require('multer');
// const upload = multer({ dest: storage });

const CLIENT_CRITERIA_FEATURE_SET_ID = 'COMMCUST';
const VEHICLE_CRITERIA_FEATURE_SET_ID = 'COMMCAR';

const INTEGRATION_ANALYSIS_SET_ID = 'COMMANA';
const INTEGRATION_ANALYSIS_TREE_ID = 'COMM';

const ANONYMOUS_ANALYSIS_SET_ID = 'OUCOMMANA';
const ANONYMOUS_ANALYSIS_TREE_ID = 'OUCOMM';

const CRITERIA_TRANSACTION_SET_ID = 'COMMTARGETSET';
const CRITERIA_TAG_SET_ID = 'TAGTARGETSET_CR';
const CRITERIA_TRAIL_SET_ID = 'LOGTARGETSET_CR';
const EXPORT_DOWNLOAD_FEATURE_SET_ID = 'COMMDNLD';
const EXPORT_RELATIVE_SET_ID = 'COMMDNLDSET';
const ANONYMOUS_TAG_SET_ID = 'TAGTARGETSET_OU';
const ANONYMOUS_TRAIL_SET_ID = 'LOGTARGETSET_OU';
const ANONYMOUS_EXPORT_DOWNLOAD_FEATURE_SET_ID = 'OUCOMMDNLD';

const TREE_ID_OF_INTEGRATED_MODE = {
  [INTEGRATED_MODE.IDENTIFIED]: INTEGRATION_ANALYSIS_TREE_ID,
  [INTEGRATED_MODE.ANONYMOUS]: ANONYMOUS_ANALYSIS_TREE_ID
};

const criteriaFeaturePromise = (setId, treeId) => {
  return Q.all([
    Q.nfcall(integrationService.getCriteriaFeaturesOfSet, setId),
    Q.nfcall(integrationService.getCriteriaFeatureTree, treeId)
  ]).spread((features, foldingTree) => {
    // winston.info('criteriaFeaturePromise getCriteriaFeaturesOfSet: ', features);
    // winston.info('criteriaFeaturePromise getCriteriaFeatureTree: ', foldingTree);
    let fields = criteriaHelper.featuresToTreeNodes(features, foldingTree);
    // get code group from features
    let refCodeGroups = _.uniq(_.reject(_.map(features, 'codeGroup'), _.isEmpty));
    return Q.nfcall(codeGroupHelper.getFeatureCodeGroupsMap, refCodeGroups).then(featureRefCodeMap => ({
      features: fields,
      featureRefCodeMap
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
      winston.error('===/features/criteria/client internal server error: ', err);
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
      let nodes = criteriaHelper.dataSetToNodes(resSet);
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
      let nodes = criteriaHelper.dataSetToNodes(resSet);
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
      let nodes = criteriaHelper.dataSetToNodes(resSet);
      // winston.info('/features/criteria/tag/sets  featureSetsToTreeNodes: ', nodes);
      res.json(nodes);
    }).fail(err => {
      winston.error('===/features/criteria/tag/sets internal server error: ', err);
      res.json(null, 500, 'internal service error');
    });
  });

  router.get('/features/criteria/trail/sets', middlewares, (req, res) => {
    Q.nfcall(integrationService.getFeatureSets, CRITERIA_TRAIL_SET_ID).then(resSet => {
      // winston.info('/features/criteria/tag/sets  getFeatureSets: %j', resSet);
      let nodes = criteriaHelper.dataSetToNodes(resSet);
      // winston.info('/features/criteria/tag/sets  featureSetsToTreeNodes: ', nodes);
      res.json(nodes);
    }).fail(err => {
      winston.error('===/features/criteria/trail/sets internal server error: ', err);
      res.json(null, 500, 'internal service error');
    });
  });

  const getTrailPeriodFeaturesPromise = (setId) => {
    switch (setId) {
      case 'LogGenpg':
        return Q.nfcall(integrationService.getTrailPeriodLogGenpgFeatures);
      case 'LogAPPpg':
        return Q.nfcall(integrationService.getTrailPeriodLogAPPpgFeatures);
      default:
        return Q([]);
    }
  };

  router.get('/features/criteria/trail/period/set/:setId', middlewares, (req, res) => {
    let setId = req.params.setId;
    getTrailPeriodFeaturesPromise(setId).then(resSet => {
      // winston.info('===getTrackRecordTrailFeaturesPromise: ', resSet);
      let nodes = criteriaHelper.dataSetToNodes(resSet);
      res.json(nodes);
    }).fail(err => {
      winston.error('===/features/criteria/trail/period/set/%s internal server error: ', setId, err);
      res.json(null, 500, 'internal service error');
    });
  });

  const getTrailHitFeaturesPromise = (setId, keyword, periodStart, periodEnd) => {
    switch (setId) {
      case 'LogEDMRead':
        return Q.nfcall(
          integrationService.getTrailPeriodLogEDMReadFeatures, keyword, periodStart, periodEnd
        ).then(data => {
          return _.orderBy(data, ['id'], ['desc']).map(row => {
            return {
              id: row.id,
              name: `${row.subject}(${row.scheduledate})`
            };
          });
        });
      case 'LogPushRead':
        return Q.nfcall(
          integrationService.getTrailPeriodLogPushReadFeatures, keyword, periodStart, periodEnd
        ).then(data => {
          return _.orderBy(data, ['pid'], ['desc']).map(row => {
            return {
              id: row.pid,
              name: `${row.title}(${moment(row.start_datetime).format('YYYY-MM-DD HH:mm')})`
            };
          });
        });
      default:
        return Q([]);
    }
  };

  router.post('/features/criteria/trail/hit/set/:setId', middlewares, (req, res) => {
    let setId = req.params.setId;
    let keyword = req.body.keyword;
    let periodStart = req.body.periodStart;
    let periodEnd = req.body.periodEnd;

    getTrailHitFeaturesPromise(setId, keyword, periodStart, periodEnd).then(resSet => {
      // winston.info('===getTrackRecordTrailFeaturesPromise: ', resSet);
      let nodes = resSet.map(data => {
        return criteriaHelper.dataSetToNode(data.id, data.name);
      });
      // let nodes = criteriaHelper.dataSetToNodes(resSet);
      res.json(nodes);
    }).fail(err => {
      winston.error('===/features/criteria/transaction/set/%s internal server error: ', setId, err);
      res.json(null, 500, 'internal service error');
    });
  });

  router.get('/export/features', middlewares, (req, res) => {
    Q.all([
      Q.nfcall(integrationService.getDownloadFeaturesOfSet, EXPORT_DOWNLOAD_FEATURE_SET_ID),
      Q.nfcall(integrationService.getCriteriaFeatureTree, INTEGRATION_ANALYSIS_TREE_ID)
    ]).spread((features, foldingTree) => {
      // winston.info('/export/features getCriteriaFeaturesOfSet: ', features);
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
      res.json(criteriaHelper.dataSetToNodes(resSet));
    }).fail(err => {
      winston.error('===/export/relative/sets internal server error: ', err);
      res.json(null, 500, 'internal service error');
    });
  });

  router.post('/export/query', middlewares, (req, res) => {
    let criteria = req.body.criteria;
    let expt = req.body.export;
    let filter = req.body.filter;
    let mode = INTEGRATED_MODE.IDENTIFIED;

    let promises = [
      // insert a new query task log
      Q.nfcall(integratedHelper.initializeQueryTaskLog, MENU_CODE.INTEGRATED_QUERY,
        JSON.stringify(criteria), JSON.stringify(expt), JSON.stringify(filter), mode, req.user.userId),
      // get feature information for analysis chart
      Q.nfcall(integrationService.getCriteriaFeaturesOfSet, INTEGRATION_ANALYSIS_SET_ID)
    ].concat(
      // get features of related data
      _.map(expt.relatives, relativeSetId => {
        return Q.all([
          Q.nfcall(integrationService.getFeatureSet, EXPORT_RELATIVE_SET_ID, relativeSetId),
          Q.nfcall(integrationService.getDownloadFeaturesOfSet, relativeSetId)
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
      })
    );

    Q.all(promises).then(([queryId, analyzableFeatures, ...results]) => {
      // winston.info('insertLog: ', insertLog);
      // winston.info('results: %j', results);
      // let analyzableFeatureIds = _.map(analyzableFeatures, 'featID');
      let relatives = _.assign({}, ...results);
      let queryScriptStage2 = integratedHelper.backendCriteriaDataWrapper(
        criteria, expt.master, {}, analyzableFeatures, relatives);

      return Q.all([
        queryScriptStage2,
        queryId,
        Q.nfcall(queryLogService.updateQueryLogProcessingData, queryId, JSON.stringify(queryScriptStage2))
      ]);
    }).spread((queryScriptStage2, queryId, ...results) => {
      // winston.info('queryId: %s', queryId);
      // winston.info('backendCriteriaData: %j', backendCriteriaData);
      // const integratedAnalysisTransService = require('../../services/trans-360backand-service');
      return Q.all([
        queryId,
        queryScriptStage2,
        Q.nfcall(criteriaHelper.frontSiteToBackendQeuryScriptTransformer, queryId, queryScriptStage2)
          // .fail(err => {
          //   Q.nfcall(integrationTaskService.setQueryTaskStatusRemoteServiceUnavailable, queryId);
          //   throw err;
          // })
      ]);
    }).spread((queryId, queryScriptStage2, queryScriptStage3) => {
      return Q.nfcall(integrationTaskService.setQueryTaskStatusPending, queryId, JSON.stringify(queryScriptStage3))
        .then(status => {
          let handler = integratedHelper.getQueryPosterHandler(queryId, mode, queryScriptStage2, queryScriptStage3);
          // let handler = integratedHelper.identicalQueryPoster(queryId, queryScriptStage2, queryScriptStage3);
          queue.get(queue.TOPIC.INTEGRATED_QUERY_TRIGGER).push(queryId, handler).next();
          return res.json({queryId, mode, status});
          // return Q.all([queryId, queryScriptStage2, queryScriptStage3]);
      });
    // }).spread((queryId, queryScriptStage2, queryScriptStage3) => {
    //   return Q.all([
    //     queryId,
    //     Q.nfcall(integratedHelper.identicalQueryPoster, queryId, queryScriptStage2, queryScriptStage3)
    //   ]);
    // }).spread((queryId, status) => {
    //   res.json({queryId, mode, status});
    }).fail(err => {
      winston.error('===/export/query internal server error: ', err);
      res.json(null, 500, 'internal service error');
    });
  });

  router.get('/export/query/:queryId', middlewares, (req, res) => {
    let queryId = req.params.queryId;
    Q.nfcall(integrationTaskService.getQueryTaskDetail, queryId).then(queryTask => {
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

  router.get('/export/download/:queryId', middlewares, auth.checkDownloadPermission(MENU_CODE.INTEGRATED_QUERY), (req, res) => {
    // const fs = require('fs');
    let queryId = req.params.queryId;
    let fileName = `${queryId}.zip`;
    let filePath = `${constants.ASSERTS_SPARK_INTEGRATED_ANALYSIS_ASSERTS_PATH_ABSOLUTE}/${fileName}`;
    let stats = fs.statSync(filePath);

    Q.nfcall(queryLogService.insertDownloadLog, {
      queryId,
      filePath,
      userId: req.user.userId,
      fileSize: stats.size
    }).then(() => {
      let deferred = Q.defer();
      res.download(filePath, fileName, err => {
        if (err) deferred.reject(err);
        else deferred.resolve();
      });
      return deferred.promise;
    }).fail(err => {
      winston.error(err);
      res.json(null, 500, 'internal service error!');
    });
  });

  router.get('/anonymous/features/criteria/tag/sets', middlewares, (req, res) => {
    Q.nfcall(integrationService.getFeatureSets, ANONYMOUS_TAG_SET_ID).then(resSet => {
      // winston.info('/features/criteria/tag/sets  getFeatureSets: %j', resSet);
      let nodes = criteriaHelper.dataSetToNodes(resSet);
      // winston.info('/features/criteria/tag/sets  featureSetsToTreeNodes: ', nodes);
      res.json(nodes);
    }).fail(err => {
      winston.error('===/features/criteria/tag/sets internal server error: ', err);
      res.json(null, 500, 'internal service error');
    });
  });

  router.get('/anonymous/features/criteria/trail/sets', middlewares, (req, res) => {
    Q.nfcall(integrationService.getFeatureSets, ANONYMOUS_TRAIL_SET_ID).then(resSet => {
      // winston.info('/features/criteria/tag/sets  getFeatureSets: %j', resSet);
      let nodes = criteriaHelper.dataSetToNodes(resSet);
      // winston.info('/features/criteria/tag/sets  featureSetsToTreeNodes: ', nodes);
      res.json(nodes);
    }).fail(err => {
      winston.error('===/features/criteria/tag/sets internal server error: ', err);
      res.json(null, 500, 'internal service error');
    });
  });

  router.get('/anonymous/export/features', middlewares, (req, res) => {
    Q.all([
      Q.nfcall(integrationService.getDownloadFeaturesOfSet, ANONYMOUS_EXPORT_DOWNLOAD_FEATURE_SET_ID),
      Q.nfcall(integrationService.getCriteriaFeatureTree, ANONYMOUS_ANALYSIS_TREE_ID)
    ]).spread((features, foldingTree) => {
      // winston.info('/export/features getCriteriaFeaturesOfSet: ', features);
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
    let mode = INTEGRATED_MODE.ANONYMOUS;

    // winston.info(req.body.export);
    Q.all([
      Q.nfcall(
        integratedHelper.initializeQueryTaskLog, MENU_CODE.ANONYMOUS_QUERY, JSON.stringify(criteria),
        JSON.stringify(expt), JSON.stringify(filter), mode, req.user.userId),
      Q.nfcall(integrationService.getCriteriaFeaturesOfSet, ANONYMOUS_ANALYSIS_SET_ID)
    ]).then(([queryId, analyzableFeatures]) => {
      // winston.info('insertLog: ', insertLog);
      // winston.info('analyzableFeatures: %j', analyzableFeatures);
      // let analyzableFeatureIds = _.map(analyzableFeatures, 'featID');
      let relatives = {};
      let queryScriptStage2 =
        integratedHelper.backendCriteriaDataWrapper(criteria, expt.master, {}, analyzableFeatures, relatives);

      return Q.all([
        queryScriptStage2,
        queryId,
        Q.nfcall(queryLogService.updateQueryLogProcessingData, queryId, JSON.stringify(queryScriptStage2))
      ]);
    }).spread((queryScriptStage3, queryId, ...results) => {
      return Q.nfcall(integrationTaskService.setQueryTaskStatusPending, queryId, JSON.stringify(queryScriptStage3))
        .then(status => {
          let handler = integratedHelper.getQueryPosterHandler(queryId, mode, queryScriptStage3, queryScriptStage3);
          // let handler = integratedHelper.anonymousQueryPoster(queryId, queryScriptStage3);
          queue.get(queue.TOPIC.INTEGRATED_QUERY_TRIGGER).push(queryId, handler).next();
          return res.json({queryId, mode, status});
        // return Q.all([queryId, queryScriptStage3]);
      });
    // }).spread((queryId, queryScriptStage3) => {
    //   return Q.all([
    //     queryId,
    //     Q.nfcall(integratedHelper.anonymousQueryPoster, queryId, queryScriptStage3)
    //   ]);
    // }).spread((queryId, status) => {
    //   res.json({queryId, mode, status});
    }).fail(err => {
      winston.error('===/export/query internal server error: ', err);
      res.json(null, 500, 'internal service error');
    });
  });

  // chart
  router.get('/:mode/query/:queryId/navigate/features', middlewares, (req, res) => {
    let queryId = req.params.queryId;
    let mode = req.params.mode;
    Q.nfcall(queryLogService.getQueryLog, queryId).then(queryLogData => {
      // let featureIds = JSON.parse(queryLogData.reserve1).export.analyzable.features;
      // winston.info('featureIds: %j', featureIds);
      return Q.all([
        Q.nfcall(integratedHelper.getStatisticFeaturesOfQueryTask, queryId),
        Q.nfcall(integrationService.getCriteriaFeatureTree, TREE_ID_OF_INTEGRATED_MODE[mode])
      ]);
    }).spread((features, foldingTree) => {
      // winston.info('criteriaFeaturePromise getCriteriaFeaturesOfSet: ', features);
      // winston.info('criteriaFeaturePromise getCriteriaFeatureTree: ', foldingTree);
      let fields = criteriaHelper.featuresToTreeNodes(features, foldingTree);
      res.json(fields);
      // get code group from features
      // let refCodeGroups = _.uniq(_.reject(_.map(features, 'codeGroup'), _.isEmpty));
      // return Q.nfcall(codeGroupService.getFeatureCodeGroups, refCodeGroups).then(codeGroupResSet => ({
      //   features: fields,
      //   featureRefCodeMap: _.groupBy(codeGroupResSet, 'codeGroup')
      // }));
    }).fail(err => {
      winston.error('===/:mode/query/:queryId/navigate/features internal server error: ', err);
      res.json(null, 500, 'internal service error');
    });
  });

  router.get('/:mode/query/:queryId/chart/feature/:featureId', middlewares, (req, res) => {
    let mode = req.params.mode;
    let queryId = req.params.queryId;
    let featureId = req.params.featureId;

    Q.all([
      Q.nfcall(integratedHelper.getStatisticFeatureOfQueryTask, queryId, featureId),
      Q.nfcall(integrationStatisticService.getStatisticChartOfFeature, queryId, featureId)
    ]).spread((feature, chartData) => {
      let data = integratedHelper.chartDataProcessor(feature, chartData);
      // winston.info('chartData: ', data);
      res.json(data);
    });
  });

  return router;
};