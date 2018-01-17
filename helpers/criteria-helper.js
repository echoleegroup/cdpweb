const _ = require('lodash');
const Q = require('q');
const moment = require('moment');
const shortid = require('shortid');
const winston = require('winston');
const _connector = require('../utils/sql-query-util');

const FOLDER_MODEL_TEMPLATE = {
  type: 'folder',
  id: undefined,
  label: undefined,
  fields: []
};

const FIELD_MODEL_TEMPLATE = {
  type: 'field',
  id: undefined,
  label: undefined,
  data_type: 'text', //num, text, date, refOption
  ref: undefined, //for data_type: refOption
  default_value: undefined  //for refOption, set default value as array object, e.g. default_value: ['M']
};

const FIELD_REF_OPTIONS_TEMPLATE = {
  refCode: undefined,
  optCode: undefined,
  label: undefined,
  seq: '0'
};

const FEATURE_DATATYPE_TO_INPUT_TYPE = {
  //digit
  bigint: 'number',
  bit: 'number',
  decimal: 'number',
  int: 'number',
  money: 'number',
  numeric: 'number',
  smallint: 'number',
  smallmoney: 'number',
  tinyint: 'number',
  //float
  float: 'number',
  real: 'number',
  //date
  date: 'date',
  datetime2: 'date',
  datetime: 'date',
  datetimeoffset: 'date',
  smalldatetime: 'date',
  time: 'date',
  //literal
  char: 'text',
  text: 'text',
  varchar: 'text',
  //string
  nchar: 'text',
  ntext: 'text',
  nvarchar: 'text'
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

const FieldModelWrapper = (rawField) => {
  // set data_type properties
  let dataTypeProperties = {
    data_type: FEATURE_DATATYPE_TO_INPUT_TYPE[rawField.dataType]
  };
  if (!_.isEmpty(rawField.codeGroup)) {
    dataTypeProperties = {
      data_type: FIELD_REF_DATA_TYPE,
      ref: rawField.codeGroup
    };
    //save ref to fetch options latter
    //fieldRefs.push(rawField.codeGroup);
  }

  // to complete field model
  return Object.assign({}, FIELD_MODEL_TEMPLATE, dataTypeProperties, {
    id: rawField.featID,
    label: rawField.featName
  });
};

const RefFieldHandler = (criteria, fieldDef) => {
  const REF_FIELD_COMPARE_OPERATOR_DICT = Object.assign({}, SQL_OPERATOR_DICT, {
    eq: 'IN',
    ne: 'NOT IN'
  });
  let query_value_list = _.isEmpty(criteria.value)? '': `('${criteria.value.join('\',\'')}')`;
  let query = `${fieldDef.featID} ${REF_FIELD_COMPARE_OPERATOR_DICT[criteria.operator]} ${query_value_list}`;
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
    //collector.params = Object.assign(collector.params, params);
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
const ChildSqlCriteriaComposer = (statements, fieldDict, paramsIndex=0) => {
  let collector = {
    sqlExpressions: [],
    params: [],
    paramsIndex
  };
  return statements.reduce((collector, criteria) => {
    let criteriaType = criteria.type;
    let fieldDef = fieldDict[criteria.field_id];
    let fieldDataType = criteria.data_type;
    let fieldValue = criteria.value;
    let fieldOperator = criteria.operator;

    if (CRITERIA_FIELD_TYPE === criteriaType) { //type === field
      if (CRITERIA_FIELD_TYPE === fieldDataType) {  //data_type === refOption
        let query = RefFieldHandler(criteria, fieldDef);
        collector.sqlExpressions.push(query);
      } else {
        let paramValue = undefined;
        let query = `${fieldDef.featID} ${SQL_OPERATOR_DICT[fieldOperator]}`;

        if (fieldValue) {
          try {
            if (FIELD_DATE_DATA_TYPE === fieldDataType) { //data_type === date
              paramValue = new Date(fieldValue);
              // paramValue = ('le' === fieldOperator)?
              //   moment(fieldValue).endOf('day'):
              //   moment(fieldValue).startOf('day');
            } else if (FIELD_DATETIME_DATA_TYPE === fieldDataType) { //data_type === datetime
              paramValue = new Date(fieldValue);
              // paramValue = ('le' === fieldOperator)?
              //   moment(fieldValue).endOf('minute'):
              //   moment(fieldValue).startOf('minute');
            } else if (FIELD_TEXT_DATA_TYPE === fieldDataType) {  //data_type === text
              paramValue = fieldValue + '';
            } else if (FIELD_NUMBER_DATA_TYPE === fieldDataType) {  //data_type === number
              paramValue = fieldValue * 1;
            }

            let paramVariable = `${fieldDef.featID}_${collector.paramsIndex++}`;
            query = `${query} @${paramVariable}`;
            collector.params.push({
              name: paramVariable,
              type: fieldDef.dataType,
              value: paramValue
            });
          } catch (e) {
            winston.error('convert input value to sql parameter value failed!');
          }
        }
        collector.sqlExpressions.push(query);
      } //end of data_type handler
    } else {
      let childCriteria = ChildSqlCriteriaComposer(criteria.criteria, fieldDict, collector.paramsIndex);
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

  criteriaFeaturesToFields: (rawFields, foldingTree) => {
    winston.info('===criteriaFeaturesToFields: ', rawFields);
    let foldingFields = foldingTree.reduce((foldingFields, node) => {
      winston.info('===criteriaFeaturesToFields::foldingTree ', node);
      if ('ROOT' === node.parentID) { // virtual node: folder

        // extract all the raw fields, who's featID is referenced to node's nodeID
        // and its parentID references to current folder node
        let childRawFields = _.remove(rawFields, (rawField) => {
          return _.findIndex(foldingTree, {
            nodeID: rawField.featID,
            parentID: node.nodeID
          }) > -1;
        });

        if (childRawFields.length > 0) {
          //create a folder model
          let folderModel = Object.assign({}, FOLDER_MODEL_TEMPLATE, {
            id: node.nodeID,
            label: node.nodeName
          });

          folderModel.fields = childRawFields.map(rawField => {
            return FieldModelWrapper(rawField);
          });

          foldingFields.push(folderModel);  //push current folder model to result set
        }
      } else {
        // ignore fields
      }
      return foldingFields; //return and reduce to next node
    }, []);

    //put all un-folded field to an virtual node
    if(rawFields.length > 0) {
      //create a folder model
      let folderModel = Object.assign({}, FOLDER_MODEL_TEMPLATE, {
        id: shortid.generate(),
        label: LABEL_UNFOLDED
      });
      //push all un-folded field in this virtual node.
      //** use ... to spread the rawFields array
      folderModel.fields = rawFields.map(rawField => {
        return FieldModelWrapper(rawField);
      });
      foldingFields.push(folderModel);
    }

    return foldingFields;
  },

  codeGroupToRefFields: (codeGroupDict) => {
    //rename code group properties for frontend
    return _.reduce(codeGroupDict, (fieldRefs, codeGroupBody, key) => {
      fieldRefs[key] = Object.assign({}, FIELD_REF_OPTIONS_TEMPLATE, {
        refCode: codeGroupBody.codeGroup,
        optCode: codeGroupBody.codeValue,
        label: codeGroupBody.codeLabel,
        seq: '0'
      });
      return fieldRefs;
    }, {});
  },

  inputCriteriaToSqlWhere: (statements, fieldDict) => {
    let operator = 'and';
    let childCriteria = ChildSqlCriteriaComposer(statements, fieldDict);
    winston.info('===inputCriteriaToSqlWhere::ChildSqlCriteriaComposer: ', childCriteria);
    let sqlWhere = ChildSqlCriteriaExpressionHandler(childCriteria, {operator});
    winston.info('===inputCriteriaToSqlWhere::ChildSqlCriteriaExpressionHandler: %s', sqlWhere);
    return {
      customCriteriaSqlWhere: sqlWhere,
      paramsDynamic: childCriteria.params
    };
  }
};

