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

module.exports = (app) => {
  winston.info('[api-model] Creating api-custom-target route.');
  const router = express.Router();

  /**
   * get available features (and folds), that user able to set filter criteria.
   * */
  router.get('/:mdId/:batId/criteria/features', middlewares, (req, res) => {
    let mdId = req.params.mdId;
    let batId = req.params.batId;
    winston.info('/criteria/features(mdId=%s, batId=%s)', mdId, batId);

    Q.all([
      Q.nfcall(criteriaService.getCustomCriteriaFeatures, mdId, batId, criteriaHelper.MODEL_FEATURE_CATEGORY_ID, criteriaHelper.CUSTOMER_FEATURE_SET_ID),
      Q.nfcall(criteriaService.getCustomCriteriaFeatureTree, criteriaHelper.CUSTOMER_FEATURE_SET_ID)
    ]).spread((features, foldingTree) => {
      winston.info('getCustomCriteriaFeatures: ', features);
      winston.info('getCustomCriteriaFeatureTree: ', foldingTree);
      // get code group from features
      // ** IMPORTANT: get code group before transforming features to tree nodes **
      // ** because featuresToTreeNodes is a mutated function, which move folded fields out of features **
      let refCodeGroups = _.uniq(_.reject(_.map(features, 'codeGroup'), _.isEmpty));
      let fields = criteriaHelper.featuresToTreeNodes(features, foldingTree);
      return Q.nfcall(codeGroupService.getFeatureCodeGroups, refCodeGroups).then(codeGroupResSet => ({
        features: fields,
        featureRefCodeMap: criteriaHelper.codeGroupToFeatureRef(codeGroupResSet)
      }));
    }).then(resSet => {
      res.json(resSet);
    }).fail(err => {
      winston.error('===/%s/%s/criteria/fields internal server error: ', mdId, batId, err);
      res.json(null, 500, 'internal service error');
    });
  });

  router.post('/:mdId/:batId/criteria/preview', middlewares, (req, res) => {
    let mdId = req.params.mdId;
    let batId = req.params.batId;
    let isIncludeModelTarget = req.body.isIncludeModelTarget;
    let statements = req.body.statements;

    winston.info('/criteria/preview: mdId=%s, batId=%s', mdId, batId);
    winston.info('/criteria/preview: isIncludeModelTarget=%s', isIncludeModelTarget);
    winston.info('/criteria/preview: statements=%j', statements);

    Q.all([
      Q.nfcall(modelService.getBatchTargetInfoOfCategory, mdId, batId, criteriaHelper.MODEL_LIST_CATEGORY),
      Q.nfcall(criteriaService.getCustomCriteriaFeatures, mdId, batId, criteriaHelper.MODEL_FEATURE_CATEGORY_ID, criteriaHelper.CUSTOMER_FEATURE_SET_ID),
      //Q.nfcall(modelService.getDownloadFeature, criteriaHelper.CUSTOMER_FEATURE_SET_ID)
    ]).spread((model, features, downloadFeatures) => {
      //downloadFeatures = _.map(downloadFeatures, 'featID');
      winston.info('/%s/%s/criteria/preview :: model: ', mdId, batId, model);

      return [Q.nfcall(criteriaService.queryTargetByCustomCriteria, mdId, batId, statements, model, features, []), model];
    }).spread((results, model) => {
      // winston.info('/%s/%s/criteria/preview :: queryTargetByCustomCriteria: ', mdId, batId, results);
      // winston.info('/%s/%s/criteria/preview :: model.batListThold: ', mdId, batId, model.batListThold);
      let [resultsInTarget, resultsExcludeTarget] = _.partition(results, (obj) => {
        return (obj['_mdListScore'] >= model.batListThold);
      });
      // winston.info('/%s/%s/criteria/preview :: resultsInTarget: ', mdId, batId, resultsInTarget.length);
      // winston.info('/%s/%s/criteria/preview :: resultsExcludeTarget: ', mdId, batId, resultsExcludeTarget.length);
      let sizeOfCriteriaResult = (isIncludeModelTarget)? (resultsInTarget.length + resultsExcludeTarget.length): resultsExcludeTarget.length;
      let sizeOfResultsInTarget = sizeOfCriteriaResult - resultsExcludeTarget.length;

      res.json({sizeOfCriteriaResult, sizeOfResultsInTarget});
    }).fail(err => {
      winston.error('===/%s/%s/criteria/preview internal server error: ', mdId, batId, err);
      res.json(null, 500, 'internal service error');
    });
  });

  router.post('/:mdId/:batId/criteria/export', middlewares, (req, res) => {
    let mdId = req.params.mdId;
    let batId = req.params.batId;
    let criteria = JSON.parse(req.body.criteria);
    winston.info('/criteria/export: criteria=%j', criteria);
    let isIncludeModelTarget = criteria.isIncludeModelTarget;
    let statements = criteria.statements;

    winston.info('/criteria/export: mdId=%s, batId=%s', mdId, batId);
    winston.info('/criteria/export: isIncludeModelTarget=%s', isIncludeModelTarget);
    winston.info('/criteria/export: statements=%j', statements);

    Q.all([
      Q.nfcall(modelService.getBatchTargetInfoOfCategory, mdId, batId, criteriaHelper.MODEL_LIST_CATEGORY),
      Q.nfcall(criteriaService.getCustomCriteriaFeatures, mdId, batId, criteriaHelper.MODEL_FEATURE_CATEGORY_ID, criteriaHelper.CUSTOMER_FEATURE_SET_ID),
      Q.nfcall(exportService.getDownloadFeatures, criteriaHelper.CUSTOMER_FEATURE_SET_ID)
    ]).spread((model, features, downloadFeatures) => {
      let downloadFeatureIds = [];
      let downloadFeatureLabels = [];
      _.forEach(downloadFeatures, feature => {
        downloadFeatureIds.push(feature.featID);
        downloadFeatureLabels.push(feature.featName);
      });
      // winston.info('/%s/%s/criteria/export :: downloadFeatureIds: ', mdId, batId, downloadFeatureIds);
      return [
        model,
        downloadFeatureIds,
        downloadFeatureLabels,
        Q.nfcall(criteriaService.queryTargetByCustomCriteria, mdId, batId, statements, model, features, downloadFeatureIds)];
    }).spread((model, downloadFeatureIds, downloadFeatureLabels, resultSet) => {
      let [resultsInTarget, resultsExcludeTarget] = _.partition(resultSet, (row) => {
        return (row['_mdListScore'] >= model.batListThold);
      });
      resultSet = (isIncludeModelTarget)? resultSet: resultsExcludeTarget;

      //arrange result set into specific format, to export as xlsx by node-xlsx
      let exportDateSet = [];
      exportDateSet.push(downloadFeatureLabels);
      exportDateSet = exportDateSet.concat(resultSet.map((row) => { //transform resultSet[{row},{row}] into[[row],[row]]
        //transform row object into array in the order of downloadFeatureIds
        return downloadFeatureIds.map(featId => row[featId]);
      }));

      //TODO: export as xlsx file
      fileHelper.sendZipArchivedExcel({res,
        xlsxDataSet: exportDateSet,
        password: req.user.userId.toLowerCase()
      });
    }).fail(err => {
      winston.error('===/%s/%s/criteria/export internal server error: ', mdId, batId, err);
      res.json(null, 500, 'internal service error');
    });
  });

  router.get('/:mdId/:batId/potential/summary', middlewares, (req, res) => {
    let mdId = req.params.mdId;
    let batId = req.params.batId;

    Q.nfcall(modelService.getBatchTargetSummaryOfCategory, mdId, batId, criteriaHelper.MODEL_LIST_CATEGORY).then(summary => {
      res.json(_.pick(summary, ['popName', 'popDesc', 'categCount', 'lastTimeBatch']));
    }).fail(err => {
      winston.error('===/%s/%s/criteria/fields internal server error: ', mdId, batId, err);
      res.json(null, 500, 'internal service error');
    });
  });

  router.get('/:mdId/:batId/criteria/history', middlewares, (req, res) => {
    res.json({
      code: 200,
      data: {},
      message: ''
    });
  });

  router.get('/:mdId/:batId/criteria/history/:id', middlewares, (req, res) => {
    Q.nfcall(criteriaService.getCriteriaHistory, req.params.id).then((criteria) => {
      res.json(criteria);
    }).fail((err) => {
      winston.error('===api-criteria.getCriteriaHistory error: ', err);
    });
  });

  router.get('/:mdId/:batId/criteria/features/test', factory.ajax_response_factory(), (req, res) => {
    res.json({
      features: [
        {
          type: 'tail',
          id: 'last_visit_date',
          label: '最後訪問日',
          data_type: 'date',
          default_value: Date.now()
        }, {
          type: 'branch',
          id: 'customer_profile',
          label: '客戶屬性',
          children: [{
            type: 'tail',
            id: 'gender',
            label: '性別',
            data_type: 'refOption',
            ref: 'gender',
            default_value: ['M']
          }, {
            type: 'tail',
            id: 'gender2',
            label: '性別2',
            data_type: 'refOption',
            ref: 'booleanYN',
            default_value: ['M']
          }, {
            type: 'tail',
            id: 'age',
            label: '年紀',
            data_type: 'number'
          }]
        }, {
          type: 'branch',
          id: 'inter_action',
          label: '互動狀態',
          children: [{
            type: 'tail',
            id: 'lexus',
            label: 'LEXUS保有台數',
            data_type: 'number'
          }, {
            type: 'tail',
            id: 'toyota',
            label: 'TOYOTA保有台數',
            data_type: 'number'
          }]
        }
      ],
      featureRefCodeMap: {
        product: [{
          refCode: 'product',
          optCode: 'abc',
          label: '福義軒',
          seq: '2'
        }, {
          refCode: 'product',
          optCode: 'bcd',
          label: '福義軒2',
          seq: '1'
        }, {
          refCode: 'product',
          optCode: 'cde',
          label: '福義軒3',
          seq: '2d'
        }],
        carPurpose: [{
          refCode: 'carPurpose',
          optCode: '1',
          label: '送禮',
          seq: '2d'
        }, {
          refCode: 'carPurpose',
          optCode: '2',
          label: '自用',
          seq: '2d'
        }, {
          refCode: 'carPurpose',
          optCode: '3',
          label: '兩相宜',
          seq: '2d'
        }],
        booleanYN: [{
          refCode: 'booleanYN',
          optCode: 'Y',
          label: '是',
          seq: '2d'
        }, {
          refCode: 'booleanYN',
          optCode: 'N',
          label: '否',
          seq: '2d'
        }],
        gender: [{
          refCode: 'gender',
          optCode: 'M',
          label: '男',
          seq: '1'
        }, {
          refCode: 'gender',
          optCode: 'F',
          label: '女',
          seq: '2'
        }]
      }
    });
  });

  router.get('/:mdId/:batId/criteria/history/:id/test', factory.ajax_response_factory(), (req, res) => {
    res.json([
      { //自訂名單下載
        uuid: shortid.generate(),
        type: 'combo',  //combo, refDetails, field, bundle, tag, fingerprint
        operator: 'or',  //and, or, eq, ne, lt, le, gt, ge, not
        criteria: [{
          uuid: shortid.generate(),
          type: 'field',
          cate: null,
          field_id: 'last_visit_date',
          field_label: '最近訪問日',
          value: Date.now(),
          data_type: 'date',
          operator: 'lt'
        }, {
          uuid: shortid.generate(),
          type: 'bundle',
          operator: 'and',
          criteria: [{
            uuid: shortid.generate(),
            type: 'field',
            cate: 'customer_profile',
            field_id: 'age',
            field_label: '年紀',
            value: 40,
            data_type: 'number',
            operator: 'lt'
          }, {
            uuid: shortid.generate(),
            type: 'field',
            cate: 'interaction',
            field_id: 'toyota',
            field_label: 'TOYOTA保有台數',
            value: 2,
            data_type: 'number',
            operator: 'gt'
          }]
        }]
      }
    ]);
  });

  return router;
};