const _ = require('lodash');
const shortid = require('shortid');
const winston = require('winston');

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
  // to complete field model
  return _.assign({}, TAIL_MODEL_TEMPLATE, {
    id: feature.featID,
    label: feature.featName,
    data_type: feature.dataType,
    input_type: feature.uiInputType,
    ref: _.isEmpty(feature.codeGroup)? null: feature.codeGroup
  });
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

module.exports = {
  CUSTOMER_FEATURE_SET_ID: CUSTOMER_FEATURE_SET_ID,
  MODEL_FEATURE_CATEGORY_ID: MODEL_FEATURE_CATEGORY_ID,
  MODEL_LIST_CATEGORY: MODEL_LIST_CATEGORY,
  //MODEL_COLUMN_PREFIX_BIGTABLEKEY: MODEL_COLUMN_PREFIX_BIGTABLEKEY,
  //MAX_MODEL_KEYS: MAX_MODEL_KEYS,
  //TABLE_MODEL_LIST_DETAIL: TABLE_MODEL_LIST_DETAIL,

  featuresToTreeNodes: (features, foldingTree) => {
    // winston.info('===featuresToTreeNodes: ', features);
    let foldingNodes = foldingTree.reduce((foldingNodes, node) => {
      // winston.info('===featuresToTreeNodes::foldingTree ', node);
      if ('ROOT' === node.parentID) { // virtual node: folder

        // extract all the raw features, who's featID is referenced to node's nodeID
        // and its parentID references to current folder node
        let childFeatures = _.remove(features, (feature) => {
          return _.findIndex(foldingTree, {
            nodeID: feature.featID,
            parentID: node.nodeID
          }) > -1;
        });

        if (childFeatures.length > 0) {
          //create a folder model
          let branchModel = _.assign({}, BRANCH_MODEL_TEMPLATE, {
            id: node.nodeID,
            label: node.nodeName
          });

          branchModel.children = childFeatures.map(feature => {
            return TailModelWrapper(feature);
          });

          foldingNodes.push(branchModel);  //push current folder model to result set
        }
      } else {
        // ignore features
      }
      return foldingNodes; //return and reduce to next node
    }, []);

    //put all un-folded field to an virtual node
    if(features.length > 0) {
      //create a folder model
      let branchModel = _.assign({}, BRANCH_MODEL_TEMPLATE, {
        id: shortid.generate(),
        label: LABEL_UNFOLDED
      });
      //push all un-folded field in this virtual node.
      //** use ... to spread the features array
      branchModel.children = features.map(feature => {
        return TailModelWrapper(feature);
      });
      foldingNodes.push(branchModel);
    }

    return foldingNodes;
  },

  relativeSetsToNodes: (sets) => {
    return sets.map(set => {
      return _.assign({}, TAIL_MODEL_TEMPLATE, {
        id: set.setId,
        label: set.setName
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
  }
};

