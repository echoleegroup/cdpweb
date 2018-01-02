'use strict'

const express = require('express');
const winston = require('winston');
const Q = require('q');
const _ = require('lodash');
const auth = require("../../middlewares/login-check");
const factory = require("../../middlewares/response-factory");
const criteriaService = require('../../services/criteria-service');
const middlewares = [factory.ajax_response_factory(), auth.ajaxCheck()];

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
  router.get('/fields/:ref_code', middlewares, (req, res) => {
    winston.info('/criteria/fields: ', req.params.ref_code);
    //get fields
    Q.nfcall(criteriaService.getFilterFields, req.params.ref_code).then((fields) => {
      //scan all fields and collect all the ref tags, instead of fetch ref data directly
      // because one tag may be referenced by more than one field.
      const getFieldRefPromise = (fields) => {
        return fields.reduce((collector, field) => {
          if ('field' === field.type && 'refOption' === field.data_type) {
            //fetch options by ref code
            collector.push(field.ref);
          } else if ('folder' === field.type) {
            collector = collector.concat(getFieldRefPromise(field.fields));
          }
          return collector;
        }, []);
      };

      let refPromises = _.uniq(getFieldRefPromise(fields)).map((ref) => {
        return Q.nfcall(criteriaService.getFieldReference, ref).then((refData) => {
          return {
            [ref]: refData
          };
        });
      });
      return [fields, Q.all(refPromises)];
    }).spread((fields, refDictionary) => {
      res.json({
        fields: fields,
        fieldRefs: refDictionary
      });
    }).fail((err) => {
      winston.error('===api-criteria.getFilterFields error: ', err);
    });
  });

  router.get('/history/:id', middlewares, (req, res) => {
    Q.nfcall(criteriaService.getCriteriaHistory, req.params.id).then((criteria) => {
      res.json(criteria);
    }).fail((err) => {
      winston.error('===api-criteria.getFilterFields error: ', err);
    });
  });

  return router;
};