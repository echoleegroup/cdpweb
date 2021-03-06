'use strict'

const express = require('express');
const winston = require('winston');
const moment = require('moment');
const Q = require('q');
const _ = require('lodash');
const path = require('path');
const shortid = require('shortid');
const auth = require("../../middlewares/login-check");
const factory = require("../../middlewares/response-factory");
const criteriaService = require('../../services/custom-target-service');
const codeGroupService = require('../../services/code-group-service');
const exportService = require('../../services/export-service');
const modelService = require('../../services/model-service');
const queryService = require('../../services/query-log-service');
const criteriaHelper = require('../../helpers/criteria-helper');
const codeGroupHelper = require('../../helpers/code-group-helper');
const customTargetHelper = require('../../helpers/custom-target-helper');
const fileHelper = require('../../helpers/file-helper');
const constants = require('../../utils/constants');
const MENU_CODE = constants.MENU_CODE;
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
      // winston.info('getCustomCriteriaFeatures: ', features);
      // winston.info('getCustomCriteriaFeatureTree: ', foldingTree);
      let fields = criteriaHelper.featuresToTreeNodes(features, foldingTree);
      // get code group from features
      let codeGroupGroups = _.uniq(_.reject(_.map(features, 'codeGroup'), _.isEmpty));
      return Q.nfcall(codeGroupHelper.getFeatureCodeGroupsMap, codeGroupGroups).then(featureRefCodeMap => ({
        features: fields,
        featureRefCodeMap
      }));
    }).then(resSet => {
      res.json(resSet);
    }).fail(err => {
      winston.error(`===/${mdId}/${batId}/criteria/fields internal server error: `, err);
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

    Q.nfcall(modelService.getBatchTargetInfoOfCategory, mdId, batId, criteriaHelper.MODEL_LIST_CATEGORY).then(model => {
      if (!model) {
        res.json(req.params, 404, 'batch data is not found!');
        throw null;
      } else {
        return [
          Q.nfcall(criteriaService.queryTargetByCustomCriteria, mdId, batId, statements, model, [], [
            customTargetHelper.get_mdListScoreCustomizer(),
            // customTargetHelper.get_mdListSentCustomizer(mdId)
          ]),
          model
        ];
      }
    }).spread((results, model) => {

      let resultsExcludeTarget = _.filter(results, row => {
        return (row['_mdListScore'] < model.batListThold);
      })

      // let [resultsInTarget, resultsExcludeTarget] = _.partition(results, (obj) => {
      //   return (obj['_mdListScore'] >= model.batListThold);
      // });

      let sizeOfCriteriaResult = (isIncludeModelTarget)? results.length: resultsExcludeTarget.length;
      let sizeOfResultsInTarget = sizeOfCriteriaResult - resultsExcludeTarget.length;

      res.json({sizeOfCriteriaResult, sizeOfResultsInTarget});

    }).fail(err => {
      if (err) {
        winston.error('===/%s/%s/criteria/preview: ', mdId, batId, err);
        res.json(req.params, 500, 'internal service error');
      }
    });
  });

  router.post('/:mdId/:batId/criteria/export', middlewares, (req, res) => {
    let mdId = req.params.mdId;
    let batId = req.params.batId;
    let criteria = JSON.parse(req.body.criteria);
    let isIncludeModelTarget = criteria.isIncludeModelTarget;
    let statements = criteria.statements;

    winston.info('/criteria/export: mdId=%s, batId=%s', mdId, batId);
    winston.info('/criteria/export: isIncludeModelTarget=%s', isIncludeModelTarget);
    winston.info('/criteria/export: statements=%j', statements);

    Q.all([
      Q.nfcall(modelService.getBatchTargetInfoOfCategory, mdId, batId, criteriaHelper.MODEL_LIST_CATEGORY),
      //Q.nfcall(criteriaService.getCustomCriteriaFeatures, mdId, batId, criteriaHelper.MODEL_FEATURE_CATEGORY_ID, criteriaHelper.CUSTOMER_FEATURE_SET_ID),
      Q.nfcall(exportService.getDownloadFeaturesOfSet, criteriaHelper.CUSTOMER_FEATURE_SET_ID),
      //write query log to DB
      Q.nfcall(queryService.insertQueryLog, {
        menuCode: MENU_CODE.CUSTOM_TARGET_FILTER,
        criteria: req.body.criteria,
        updUser: req.user.userId
      })
    ]).spread((model, downloadFeatures, queryLogRes) => {

      if (!model) {
        res.json(req.params, 404, 'batch data is not found!');
        throw null;
      } else {
        let exportFeatureIds = _.map(downloadFeatures, 'featID');
        let queryFields = _.map(_.filter(downloadFeatures, {customized: 'N'}), 'featID');
        let exportFeatureLabels = _.map(downloadFeatures, 'featName');
        // _.forEach(downloadFeatures, feature => {
        //   exportFeatureIds.push(feature.featID);
        //   downloadFeatureLabels.push(feature.featName);
        // });

        return [
          model,
          exportFeatureIds,
          exportFeatureLabels,
          Q.nfcall(criteriaService.queryTargetByCustomCriteria, mdId, batId, statements, model, queryFields, [
            customTargetHelper.get_mdListScoreCustomizer(),
            customTargetHelper.get_mdListSentCustomizer(mdId),
            customTargetHelper.get_mdListSlodCustomizer()
          ]),
          queryLogRes.queryID];
      }

    }).spread((model, exportFeatureIds, exportFeatureLabels, resultSet, queryLogId) => {

      // let [resultsInTarget, resultsExcludeTarget] = _.partition(resultSet, row => {
      //   return (row['_mdListScore'] >= model.batListThold);
      // });
      // resultSet = (isIncludeModelTarget)? resultSet: resultsExcludeTarget;
      if (isIncludeModelTarget) {
        resultSet = _.filter(resultSet, row => {
          return (row['_mdListScore'] < model.batListThold);
        });
      }

      //arrange result set into specific format, to export as xlsx by node-xlsx
      let exportDateSet = [exportFeatureLabels].concat(resultSet.map(row => { //transform resultSet[{row},{row}] into[[row],[row]]
        //transform row object into array in the order of exportFeatureIds
        return exportFeatureIds.map(featId => row[featId]);
      }));

      //generate excel file
      let now = moment().format('YYYYMMDDHHmm');
      let exportFilename = `自訂名單-${model.mdName}-${model.batName}-${now}.xlsx`;
      let xlsxFilename = `customize-target-${model.mdID}-${model.batID}-${now}.xlsx`;
      let xlsxFileAbsolutePath = path.join(constants.ASSERTS_CUSTOM_TARGET_ASSERTS_PATH_ABSOLUTE, xlsxFilename);

      return Q.nfcall(fileHelper.buildXlsxFile, {
        sheetName: '自訂名單',
        xlsxDataSet: exportDateSet,
        xlsxFileAbsolutePath: xlsxFileAbsolutePath,
        password: req.user.userId.toLowerCase()
      }).then(stat => {
        // const zipBuff = fileHelper.buildZipBuffer({
        //   path: [xlsxFilename],
        //   buff: [xlsxBuffer],
        //   password: req.user.userId.toLowerCase()
        // });
        return Q.nfcall(queryService.insertDownloadLog, {
          queryId: queryLogId,
          filePath: xlsxFileAbsolutePath,
          userId: req.user.userId,
          fileSize: stat.size
        }).then(result => {
          res.download(xlsxFileAbsolutePath, exportFilename);
          // const zipContentType = 'application/octet-stream';
          // const contentDisposition = require('content-disposition');
          //
          // res.setHeader('Content-Type', zipContentType);
          // res.setHeader("Content-Disposition", contentDisposition(`${filename}.zip`));
          // res.setHeader('Content-Transfer-Encoding', 'binary');
          // res.setHeader('Content-Length', zipBuff.length);
          //
          // res.end(new Buffer(zipBuff, 'binary'));
        });
      });

    }).fail(err => {
      if (err) {
        winston.error(`===/${mdId}/${batId}/criteria/export: `, err);
        res.json(req.params, 500, 'internal service error');
      }
    });
  });

  router.get('/:mdId/:batId/potential/summary', middlewares, (req, res) => {
    let mdId = req.params.mdId;
    let batId = req.params.batId;

    Q.nfcall(modelService.getBatchTargetSummaryOfCategory, mdId, batId, criteriaHelper.MODEL_LIST_CATEGORY).then(summary => {
      res.json(_.pick(summary, ['popName', 'popDesc', 'categCount', 'lastTimeBatch']));
    }).fail(err => {
      winston.error(`===/${mdId}/${batId}/criteria/fields internal server error: `, err);
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
          codeGroup: 'product',
          codeValue: 'abc',
          codeLabel: '福義軒',
          seq: '2'
        }, {
          codeGroup: 'product',
          codeValue: 'bcd',
          codeLabel: '福義軒2',
          seq: '1'
        }, {
          codeGroup: 'product',
          codeValue: 'cde',
          codeLabel: '福義軒3',
          seq: '2d'
        }],
        carPurpose: [{
          codeGroup: 'carPurpose',
          codeValue: '1',
          codeLabel: '送禮',
          seq: '2d'
        }, {
          codeGroup: 'carPurpose',
          codeValue: '2',
          label: '自用',
          seq: '2d'
        }, {
          codeGroup: 'carPurpose',
          codeValue: '3',
          codeLabel: '兩相宜',
          seq: '2d'
        }],
        booleanYN: [{
          codeGroup: 'booleanYN',
          codeValue: 'Y',
          codeLabel: '是',
          seq: '2d'
        }, {
          codeGroup: 'booleanYN',
          codeValue: 'N',
          codeLabel: '否',
          seq: '2d'
        }],
        gender: [{
          codeGroup: 'gender',
          codeValue: 'M',
          codeLabel: '男',
          seq: '1'
        }, {
          codeGroup: 'gender',
          codeValue: 'F',
          codeLabel: '女',
          seq: '2'
        }]
      }
    });
  });

  router.get('/:mdId/:batId/criteria/history/:id/test', factory.ajax_response_factory(), (req, res) => {
    res.json([
      { //自訂名單下載
        id: shortid.generate(),
        type: 'combo',  //combo, refDetails, field, bundle, tag, fingerprint
        operator: 'or',  //and, or, eq, ne, lt, le, gt, ge, not
        criteria: [{
          id: shortid.generate(),
          type: 'field',
          cate: null,
          field_id: 'last_visit_date',
          field_label: '最近訪問日',
          value: Date.now(),
          data_type: 'date',
          operator: 'lt'
        }, {
          id: shortid.generate(),
          type: 'bundle',
          operator: 'and',
          criteria: [{
            id: shortid.generate(),
            type: 'field',
            cate: null,
            field_id: 'age',
            field_label: '年紀',
            value: 40,
            data_type: 'number',
            operator: 'lt'
          }, {
            id: shortid.generate(),
            type: 'field',
            cate: null,
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