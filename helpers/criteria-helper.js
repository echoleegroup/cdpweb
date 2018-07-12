const _ = require('lodash');
const moment = require('moment');
const request = require('request');
const shortid = require('shortid');
const winston = require('winston');
const appConfig = require("../app-config");

const BRANCH_MODEL_TEMPLATE = {
  type: 'branch',
  id: undefined,
  label: undefined,
  children: []
};

const TAIL_MODEL_TEMPLATE = {
  type: 'tail',
  id: undefined,
  label: undefined,
  category:undefined,
  data_type: undefined,
  input_type: 'text',  //num, text, date, refOption,
  ref: undefined, //for input_type: refOption
  default_value: undefined  //for refOption, set default value as array object, e.g. default_value: ['M']
};

const SQL_OPERATOR_DICT = {
  and: 'AND',
  or: 'OR',
  not: 'AND NOT',
  gt: '>',
  ge: '>=',
  lt: '<',
  le: '<=',
  eq: '=',
  ne: '!=',
  nn: 'IS NOT NULL',
  in: 'IS NULL'
};

const FIELD_REF_DATA_TYPE = 'refOption';
const FIELD_DATE_DATA_TYPE = 'date';
const FIELD_DATETIME_DATA_TYPE = 'datetime';
const FIELD_NUMBER_DATA_TYPE = 'number';
const FIELD_TEXT_DATA_TYPE = 'text';

const CRITERIA_COMBO_BUNDLE_TYPE = 'combo';
const CRITERIA_BUNDLE_TYPE = 'bundle';
const CRITERIA_REF_DETAIL_TYPE = 'refDetails';
const CRITERIA_FIELD_TYPE = 'field';

const LABEL_UNFOLDED= '未分類';

const CUSTOMER_FEATURE_SET_ID = 'CUSTGENE';
const MODEL_FEATURE_CATEGORY_ID = 'tagene';
const MODEL_LIST_CATEGORY = 'tapop';

const TailModelWrapper = (feature) => {
  let necessaryProperties = ['featID', 'featName', 'dataType', 'uiInputType', 'codeGroup'];
  // let necessaryFeatures = _.pick(feature, necessaryProperties);
  let additionalFeatures = _.omit(feature, necessaryProperties);
  // to complete field model
  return _.assign({}, TAIL_MODEL_TEMPLATE, {
    id: feature.featID,
    label: feature.featName,
    data_type: feature.dataType,
    input_type: feature.uiInputType,
    ref: _.isEmpty(feature.codeGroup)? null: feature.codeGroup
  }, additionalFeatures);
};

const RefFieldHandler = (criteria) => {
  const REF_FIELD_COMPARE_OPERATOR_DICT = _.assign({}, SQL_OPERATOR_DICT, {
    eq: 'IN',
    ne: 'NOT IN'
  });
  let query_value_list = _.isEmpty(criteria.value)? '': `('${criteria.value.join('\',\'')}')`;
  let query = `${criteria.field_id} ${REF_FIELD_COMPARE_OPERATOR_DICT[criteria.operator]} ${query_value_list}`;
  return query;
};

const ChildSqlCriteriaExpressionHandler = ({sqlExpressions}, {operator}) => {
  winston.info('ChildSqlCriteriaExpressionHandler::sqlExpressions ', sqlExpressions);
  winston.info('ChildSqlCriteriaExpressionHandler::operator ', operator);
  let sql = null;
  if (sqlExpressions.length > 0) {
    if (sqlExpressions.length === 1) {
      //only on express. return it.
      sql = sqlExpressions[0];
    } else {
      //multi-criteria. join all by operator of current criteria.
      //**IMPORTANT: add space word in the front and rear of the operator!!
      let delimiter = ` ${SQL_OPERATOR_DICT[operator]} `;
      sql = `( ${sqlExpressions.join(delimiter)} )`;
    }
    //collector.paramsIndex = paramsIndex;
    //collector.params = _.assign(collector.params, params);
  }
  return sql;
};

/**
 *
 * @param criteriaList
 * @param fieldDict
 * @param paramIndex
 * @constructor
 * expect return {query: ['', ''], params: [], paramIndex: ${number}}
 */
const ChildSqlCriteriaComposer = (statements, paramsIndex=0) => {
  let collector = {
    sqlExpressions: [],
    params: [],
    paramsIndex
  };
  return statements.reduce((collector, criteria) => {
    let criteriaType = criteria.type;
    let fieldInputType = criteria.input_type;
    let fieldDataType = criteria.data_type;
    let fieldValue = criteria.value;
    let fieldOperator = criteria.operator;

    if (CRITERIA_FIELD_TYPE === criteriaType) { //type === field
      if (CRITERIA_FIELD_TYPE === fieldInputType) {  //data_type === refOption
        let query = RefFieldHandler(criteria);
        collector.sqlExpressions.push(query);
      } else {
        let paramValue = undefined;
        let query = `${criteria.field_id} ${SQL_OPERATOR_DICT[fieldOperator]}`;

        if (fieldValue) {
          try {
            if (FIELD_DATE_DATA_TYPE === fieldInputType) { //data_type === date
              paramValue = new Date(fieldValue);
              // paramValue = ('le' === fieldOperator)?
              //   moment(fieldValue).endOf('day'):
              //   moment(fieldValue).startOf('day');
            } else if (FIELD_DATETIME_DATA_TYPE === fieldInputType) { //data_type === datetime
              paramValue = new Date(fieldValue);
              // paramValue = ('le' === fieldOperator)?
              //   moment(fieldValue).endOf('minute'):
              //   moment(fieldValue).startOf('minute');
            } else if (FIELD_TEXT_DATA_TYPE === fieldInputType) {  //data_type === text
              paramValue = fieldValue + '';
            } else if (FIELD_NUMBER_DATA_TYPE === fieldInputType) {  //data_type === number
              paramValue = fieldValue * 1;
            }

            let paramVariable = `${criteria.field_id}_${collector.paramsIndex++}`;
            query = `${query} @${paramVariable}`;
            collector.params.push({
              name: paramVariable,
              type: fieldDataType,
              value: paramValue
            });
          } catch (e) {
            winston.error('convert input value to sql parameter value failed!');
          }
        }
        collector.sqlExpressions.push(query);
      } //end of data_type handler
    } else {
      let childCriteria = ChildSqlCriteriaComposer(criteria.criteria, collector.paramsIndex);
      let childSql = ChildSqlCriteriaExpressionHandler(childCriteria, criteria);
      winston.info('ChildSqlCriteriaComposer::ChildSqlCriteriaExpressionHandler: %s', childSql);
      if (childSql) {
        collector.sqlExpressions.push(childSql);
        collector.params = collector.params.concat(childCriteria.params);
        collector.paramsIndex = childCriteria.paramsIndex;
      }
    } //end of component 'field'

    return collector;
  }, collector);
};

const foldedTree = (featureMap, foldingTree, level = 0, parentId = 'ROOT') => {
  return _.filter(foldingTree, {
    treeLevel: level,
    parentID: parentId
  }).reduce((sibling, node) => {
    switch (node.isDummy) {
      case 'Y':
        let children = foldedTree(featureMap, foldingTree, level + 1, node.nodeID);
        if (children.length > 0) {
          sibling.push(_.assign({}, BRANCH_MODEL_TEMPLATE, {
            id: node.nodeID,
            label: node.nodeName,
            children
          }));
        }
        return sibling;
      default:
        let feature = featureMap[node.nodeID];
        if (feature) {
          sibling.push(TailModelWrapper(feature));
          delete featureMap[node.nodeID];
        }
        return sibling;
    }
  }, []);
};

module.exports = {
  CUSTOMER_FEATURE_SET_ID: CUSTOMER_FEATURE_SET_ID,
  MODEL_FEATURE_CATEGORY_ID: MODEL_FEATURE_CATEGORY_ID,
  MODEL_LIST_CATEGORY: MODEL_LIST_CATEGORY,
  //MODEL_COLUMN_PREFIX_BIGTABLEKEY: MODEL_COLUMN_PREFIX_BIGTABLEKEY,
  //MAX_MODEL_KEYS: MAX_MODEL_KEYS,
  //TABLE_MODEL_LIST_DETAIL: TABLE_MODEL_LIST_DETAIL,

  featuresToTreeNodes: (features, foldingTree) => {
    let featureMap = _.keyBy(features, 'featID');
    let foldingNodes = foldedTree(featureMap, foldingTree);

    let unfoldedNodes = _.values(featureMap).map(feature => {
      return TailModelWrapper(feature);
    });

    if (unfoldedNodes.length > 0) {
      foldingNodes.push(_.assign({}, BRANCH_MODEL_TEMPLATE, {
        id: shortid.generate(),
        label: LABEL_UNFOLDED,
        children: unfoldedNodes
      }));
    }

    return foldingNodes;
  },

  dataSetToNode: (id, name, category) => {
    return _.assign({}, TAIL_MODEL_TEMPLATE, {
      id: id,
      label: name,
      category: category
    });
  },

  dataSetToNodes: (sets) => {
    return sets.map(set => {
      return _.assign({}, TAIL_MODEL_TEMPLATE, {
        id: set.nodeID,
        label: set.nodeName,
        category: set.nodeCateg
      });
    });
  },

  inputCriteriaToSqlWhere: (statements) => {
    let operator = 'and';
    let childCriteria = ChildSqlCriteriaComposer(statements);
    // winston.info('===inputCriteriaToSqlWhere::ChildSqlCriteriaComposer: ', childCriteria);
    let sqlWhere = ChildSqlCriteriaExpressionHandler(childCriteria, {operator});
    // winston.info('===inputCriteriaToSqlWhere::ChildSqlCriteriaExpressionHandler: %s', sqlWhere);
    return {
      customCriteriaSqlWhere: sqlWhere,
      paramsDynamic: childCriteria.params
    };
  },

  frontSiteToBackendQeuryScriptTransformer: (queryId, queryScript, callback) => {
    const API_360_HOST = appConfig.get("API_360_HOST");
    const API_360_PORT = appConfig.get("API_360_PORT");

    const valueBuilder = (dataType, value) => {
      switch (dataType) {
        case 'string':
          return `'${value}'`;
        case 'boolean':
        case 'integer':
        case 'long':
        case 'double':
          // return value;
        case 'decimal':
          return value;
          // return `decimal(${value})`;
        case 'timestamp':
          return `timestamp('${moment(value).format('YYYY-MM-DD HH:mm:ss')}')`;
        case 'date':
          return `date('${moment(value).format('YYYY-MM-DD HH:mm:ss')}')`;
        default:
          return `'${value}'`;
      }
    };

    const expressionSparkSqlBuilder = (operator, dataType, value) => {
      let _value = valueBuilder(dataType, value);

      switch (operator) {
        case 'eq':
          return ` = ${_value}`;
        case 'ne':
          return ` != ${_value}`;
        case 'lt':
          return ` < ${_value}`;
        case 'le':
          return ` <= ${_value}`;
        case 'gt':
          return ` > ${_value}`;
        case 'ge':
          return ` >= ${_value}`;
        case 'in':
          return ' IS NULL';
        case 'nn':
          return ' IS NOT NULL';
        default:
          return '';
      }
    };

    const optionSparkSqlBuilder = (operator, dataType, options = []) => {
      let optionValues = _.map(options, option => {
        return valueBuilder(dataType, option);
      }).join(',');

      switch (operator) {
        case 'eq':
          return ` IN (${optionValues})`;
        case 'ne':
          return ` NOT IN (${optionValues})`;
        case 'in':
          return ' IS NULL';
        case 'nn':
          return ' IS NOT NULL';
        default:
          return '';
      }
    };

    const stringValueTransformer = (inputType, value) => {
      switch (inputType) {
        case 'date':
          return moment(value).format('YYYYMMDD');
        default:
          return value;
      }
    };

    const conditionExpr = (dataType, inputType, operator, value) => {
      // winston.info('dataType: ', dataType);

      switch (dataType) {
        // case 'number':
        //   return numberExprBuilder(operator, value);
        case 'string':
          let _value = stringValueTransformer(inputType, value);
          return expressionSparkSqlBuilder(operator, dataType, _value);
        // case 'date':
        //   return dateExprBuilder(operator, value);
        // case 'datetime':
        //   return datetimeExprBuilder(operator, value);
        case 'refOption':
          return optionSparkSqlBuilder(operator, dataType, value);
        default:
          return expressionSparkSqlBuilder(operator, dataType, value);
      }
    };

    const conditionWrapper = (criteria, operator = 'and') => {
      // winston.info('conditionWrapper criteria: ', criteria);
      // winston.info('conditionWrapper operator', operator);
      return _.map(criteria, condi => {
        if (!condi.field_id) {
          return {
            relation: operator,
            children: conditionWrapper(condi.criteria, condi.operator)
          };
        } else {
          return {
            relation: operator,
            column: condi.field_id,
            expr: conditionExpr(condi.data_type, condi.input_type, condi.operator, condi.value)
          }
        }
      });
    };

    const filterToPostWhereConditionWrapper = (filter) => {
      let condition = [];
      if(filter.period_start_value && filter.period_end_value) {
        condition.push({
          relation: 'and',
          column: filter.feature,
          expr: ` >= date('${moment(filter.period_start_value).format('YYYY-MM-DD')}')`
        });

        condition.push({
          relation: 'and',
          column: filter.feature,
          expr: ` <= date('${moment(filter.period_end_value).format('YYYY-MM-DD')}')`
        });
      }
      return condition;
    };

    let selectBlock = [];
    let whereBlock = [];
    let postWhereBlock = [];

    //selectBlock of master table
    selectBlock.push({
      type: "master",
      column: _.uniq(queryScript.export.master.features.concat(_.map(queryScript.statistic.features, 'feature_id')))
    });

    //selectBlock of relative tables
    selectBlock = selectBlock.concat(
      _.map(queryScript.export.relatives, (value, key) => {
        return {
          type: key,
          column: value.features
        };
      })
    );

    //where of main table
    whereBlock.push({
      type: 'master',
      condition: conditionWrapper(queryScript.criteria.client).concat(
        conditionWrapper(queryScript.criteria.vehicle))
    });
    //where of transaction type.
    //** The backend script do not currently support logically 'or' between each transaction type.
    // Ignoring outer 'combo' criteria, and wrap child criteria separately.
    let transaction = queryScript.criteria.transaction[0]? queryScript.criteria.transaction[0].criteria: [];
    _.forEach(transaction, condition => {
      whereBlock.push({
        type: condition.ref,
        condition: conditionWrapper(condition.criteria, condition.operator)
      });
    });

    //postWhere of master table
    if (!_.isEmpty(queryScript.export.master.filter)) {
      postWhereBlock.push({
        type: 'master',
        condition: filterToPostWhereConditionWrapper(queryScript.export.master.filter)
      });
    }

    postWhereBlock = postWhereBlock.concat(
      _.map(queryScript.export.relatives, (relative, type) => {
        return {
          type: type,
          condition: filterToPostWhereConditionWrapper(relative.filter)
        }
      })
    );

    let resultScript = {
      select: selectBlock,
      where: whereBlock,
      postWhere: postWhereBlock,
      statistic: queryScript.statistic
    };

    // winston.info('resultScript: ', resultScript);

    let hasTag = ((queryScript.criteria.tag.length + queryScript.criteria.trail.length) > 0) ||
      (_.intersection(
        ['TagQtn', 'TagOwnMedia', 'TagOuterMedia', 'TagEInterest', 'TagEIntent', 'TagActive'],
        _.keys(queryScript.export.relatives)
      ).length > 0);

    let requestUrl = null;
    let requestBody = null;
    if (hasTag) {
      requestUrl = `http://${API_360_HOST}:${API_360_PORT}/query_all/${queryId}`;
      requestBody = require('querystring').stringify({
        req_owner: `{${JSON.stringify(resultScript)}}`,
        req_log: JSON.stringify(queryScript)
      });

      request({
        url: requestUrl,
        method: 'POST',
        json: true,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: requestBody
      }, (error, response, body) => {
        if (error)
          callback(error, null);
        else
          callback(null, resultScript);
      });
    } else {
      requestUrl = `http://${API_360_HOST}:${API_360_PORT}/query/${queryId}`;
      requestBody = JSON.stringify(resultScript);

      request({
        url: requestUrl,
        method: 'POST',
        json: true,
        body: requestBody
      }, (error, response, body) => {
        if (error)
          callback(error, null);
        else
          callback(null, resultScript);
      });
    }

    // winston.info('queryScript: ', queryScript.statistic);
    // winston.info('requestBody.req_log: ', requestBody.req_log.statistic);


    // request({
    //   method: 'POST',
    //   uri: requestUrl,
    //   body: JSON.stringify(requestBody),
    //   json: true
    // }, (error, response, body) => {
    //   // winston.info('getTrailPeriodLogEDMReadFeatures: ', body);
    //   if (error)
    //     callback(error, null);
    //   else
    //     callback(null, resultScript);
    // });
  }
};

