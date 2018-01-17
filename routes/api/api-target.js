'use strict'

const express = require('express');
const winston = require('winston');
const Q = require('q');
const _ = require('lodash');
const shortid = require('shortid');
const auth = require("../../middlewares/login-check");
const factory = require("../../middlewares/response-factory");
const criteriaService = require('../../services/criteria-service');
const codeGroupService = require('../../services/code-group-service');
const exportService = require('../../services/export-service');
const modelService = require('../../services/model-service');
const criteriaHelper = require('../../helpers/criteria-helper');
const fileHelper = require('../../helpers/file-helper');
const middlewares = [factory.ajax_response_factory(), auth.ajaxCheck()];

module.exports = (app) => {
  winston.info('[api-model] Creating api-model route.');
  const router = express.Router();

  /**
   * get available fields (and folds), that user able to set filter criteria.
   * */
  router.get('/:mdId/:batId/criteria/fields', middlewares, (req, res) => {
    let mdId = req.params.mdId;
    let batId = req.params.batId;
    winston.info('/criteria/fields(mdId=%s, batId=%s)', mdId, batId);

    Q.all([
      Q.nfcall(criteriaService.getCustomCriteriaFeatures, mdId, batId, criteriaHelper.MODEL_FEATURE_CATEGORY_ID, criteriaHelper.CUSTOMER_FEATURE_SET_ID),
      Q.nfcall(criteriaService.getFieldFoldingTree, criteriaHelper.CUSTOMER_FEATURE_SET_ID)
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
    ]).spread((model, rawFields, downloadFeatures) => {
      //downloadFeatures = _.map(downloadFeatures, 'featID');
      winston.info('/%s/%s/criteria/preview :: model: ', mdId, batId, model);

      return [Q.nfcall(criteriaService.queryTargetByCustomCriteria, mdId, batId, statements, model, rawFields, []), model];
    }).spread((results, model) => {
      winston.info('/%s/%s/criteria/preview :: queryTargetByCustomCriteria: ', mdId, batId, results);
      winston.info('/%s/%s/criteria/preview :: model.batListThold: ', mdId, batId, model.batListThold);
      let [resultsInTarget, resultsExcludeTarget] = _.partition(results, (obj) => {
        return (obj['_mdListScore'] >= model.batListThold);
      });
      winston.info('/%s/%s/criteria/preview :: resultsInTarget: ', mdId, batId, resultsInTarget.length);
      winston.info('/%s/%s/criteria/preview :: resultsExcludeTarget: ', mdId, batId, resultsExcludeTarget.length);
      let sizeOfResultsInTarget = resultsInTarget.length;
      let sizeOfResultsExcludeTarget = resultsExcludeTarget.length;
      let size = sizeOfResultsInTarget + sizeOfResultsExcludeTarget;

      res.json({size, sizeOfResultsInTarget, sizeOfResultsExcludeTarget});
    }).fail(err => {
      winston.error('===/%s/%s/criteria/preview internal server error: ', mdId, batId, err);
      res.json(null, 500, 'internal service error');
    });
  });

  router.post('/:mdId/:batId/criteria/export', middlewares, (req, res) => {
    let mdId = req.params.mdId;
    let batId = req.params.batId;
    let criteria = JSON.parse(req.body.criteria);
    winston.info('/criteria/preview: criteria=%j', criteria);
    let isIncludeModelTarget = criteria.isIncludeModelTarget;
    let statements = criteria.statements;

    winston.info('/criteria/preview: mdId=%s, batId=%s', mdId, batId);
    winston.info('/criteria/preview: isIncludeModelTarget=%s', isIncludeModelTarget);
    winston.info('/criteria/preview: statements=%j', statements);

    Q.all([
      Q.nfcall(modelService.getBatchTargetInfoOfCategory, mdId, batId, criteriaHelper.MODEL_LIST_CATEGORY),
      Q.nfcall(criteriaService.getCustomCriteriaFeatures, mdId, batId, criteriaHelper.MODEL_FEATURE_CATEGORY_ID, criteriaHelper.CUSTOMER_FEATURE_SET_ID),
      Q.nfcall(exportService.getDownloadFeatures, criteriaHelper.CUSTOMER_FEATURE_SET_ID)
    ]).spread((model, rawFields, downloadFeatures) => {
      let downloadFeatureIds = [];
      let downloadFeatureLabels = [];
      _.forEach(downloadFeatures, feature => {
        downloadFeatureIds.push(feature.featID);
        downloadFeatureLabels.push(feature.featName);
      });
      winston.info('/%s/%s/criteria/preview :: downloadFeatureIds: ', mdId, batId, downloadFeatureIds);
      return [
        model,
        downloadFeatureIds,
        downloadFeatureLabels,
        Q.nfcall(criteriaService.queryTargetByCustomCriteria, mdId, batId, statements, model, rawFields, downloadFeatureIds)];
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

  router.get('/:mdId/:batId/criteria/fields/test', middlewares, (req, res) => {
    res.json({
      fields: [
        {
          type: 'field',
          id: 'last_visit_date',
          label: '最後訪問日',
          data_type: 'date',
          default_value: Date.now()
        }, {
          type: 'folder',
          id: 'customer_profile',
          label: '客戶屬性',
          fields: [{
            type: 'field',
            id: 'gender',
            label: '性別',
            data_type: 'refOption',
            ref: 'gender',
            default_value: ['M']
          }, {
            type: 'field',
            id: 'gender2',
            label: '性別2',
            data_type: 'refOption',
            ref: 'booleanYN',
            default_value: ['M']
          }, {
            type: 'field',
            id: 'age',
            label: '年紀',
            data_type: 'number'
          }]
        }, {
          type: 'folder',
          id: 'inter_action',
          label: '互動狀態',
          fields: [{
            type: 'field',
            id: 'lexus',
            label: 'LEXUS保有台數',
            data_type: 'number'
          }, {
            type: 'field',
            id: 'toyota',
            label: 'TOYOTA保有台數',
            data_type: 'number'
          }]
        }
      ],
      fieldRefs: {
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

  router.get('/:mdId/:batId/criteria/history/:id/test', middlewares, (req, res) => {
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