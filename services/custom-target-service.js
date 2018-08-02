const _ = require('lodash');
const Q = require('q');
const winston = require('winston');
const _connector = require('../utils/sql-query-util');
const criteriaHelper = require('../helpers/criteria-helper');
const modelService = require('./model-service');
const test_data = require('../client/test/preferred-criteria-test');

const RDB_DATATYPE_PARAMS_DICT = {
  //digit
  bigint: _connector.TYPES.BigInt,
  bit: _connector.TYPES.Bit,
  decimal: _connector.TYPES.Decimal,
  int: _connector.TYPES.Int,
  money: _connector.TYPES.Money,
  numeric: _connector.TYPES.Numeric,
  smallint: _connector.TYPES.SmallInt,
  smallmoney: _connector.TYPES.SmallMoney,
  tinyint: _connector.TYPES.TinyInt,
  //float
  float: _connector.TYPES.Float,
  real: _connector.TYPES.Real,
  //date
  date: _connector.TYPES.Date,
  datetime2: _connector.TYPES.DateTime2,
  datetime: _connector.TYPES.DateTime,
  datetimeoffset: _connector.TYPES.DateTimeOffset,
  smalldatetime: _connector.TYPES.SmallDateTime,
  time: _connector.TYPES.Time,
  //literal
  char: _connector.TYPES.Char,
  text: _connector.TYPES.Text,
  varchar: _connector.TYPES.VarChar,
  //string
  nchar: _connector.TYPES.NChar,
  ntext: _connector.TYPES.NText,
  nvarchar: _connector.TYPES.NVarChar,
  //object
  binary: _connector.TYPES.Binary,
  image: _connector.TYPES.Image,
  varbinary: _connector.TYPES.VarBinary
};

const RDB_DATATYPE = (datatype) => {
  let t = RDB_DATATYPE_PARAMS_DICT[datatype];
  if (!t) {
    throw new Error('unsupported data type');
  }
  return t;
};

module.exports.getCustomCriteriaFeatures = (mdId, batId, mdFeatCateg, setId, callback) => {
  const sql = 'SELECT featID FROM cu_CustomFeat WHERE setID = @setId ' +
    'UNION ' +
    'SELECT featID FROM md_FeatDet WHERE mdFeatCateg = @mdFeatCateg AND mdID = @mdId AND batID = @batId';
  let request = _connector.queryRequest()
    .setInput('setId', _connector.TYPES.NVarChar, setId)
    .setInput('mdFeatCateg', _connector.TYPES.NVarChar, mdFeatCateg)
    .setInput('mdId', _connector.TYPES.NVarChar, mdId)
    .setInput('batId', _connector.TYPES.NVarChar, batId);

  Q.nfcall(request.executeQuery, sql).then(results => {
    let featureIds = _.map(results, 'featID');
    return Q.nfcall(modelService.getBatchCategoryFeatures, featureIds);
  }).then((result) => {
    callback(null, result);
  }).fail(err => {
    winston.error('===getCustomCriteriaFeatures failed:', err);
    callback(err);
  });
};

module.exports.getCustomCriteriaFeatureTree = (treeId, callback) => {
  const sql = 'SELECT nodeID, parentID, treeLevel, nodeName, isDummy ' +
    'FROM ft_CategTree ' +
    'WHERE treeID = @treeId ' +
    'ORDER BY treeLevel, treeSeq';
  Q.nfcall(_connector
    .queryRequest()
    .setInput('treeId', _connector.TYPES.NVarChar, treeId)
    .executeQuery, sql).then((result) => {
    callback(null, result);
  }).fail((err) => {
    winston.error('===criteria-service::getCustomCriteriaFeatureTree(treeId=%s) failed: ', treeId, err);
    callback(err);
  });
};

module.exports.queryTargetByCustomCriteria = (mdId, batId, statements, model, downloadFeatureIds=[], customizer=[], callback) => {
  const MODEL_COLUMN_PREFIX_BIGTABLEKEY = 'bigtbKey';
  const MODEL_LIST_COLUMN_PREFIX_BIGTABLEKEY = 'mdListKey';

  //let bigTable = model.bigtbName;
  let bigTable = model.bigtbName;

  // compose start!
  let sqlSelect = downloadFeatureIds;
  let sqlReduction = [];
  let sqlFrom = ['md_ListDet detail'];
  let sqlJoin = [];
  let sqlWhere = [];
  let sqlSort = ['detail.mdListScore DESC'];
  let TYPES = _connector.TYPES;
  let request = _connector.queryRequest();

  //join relation between md_ListDet and  big table
  let innerJoin = [];
  let i = 0;
  //there are max 6 columns for key in big table. BUT, here check unlimited columns until first empty value occurred.
  while (!_.isEmpty(model[MODEL_COLUMN_PREFIX_BIGTABLEKEY + (++i)])) {
    innerJoin.push(`big_table.${model[MODEL_COLUMN_PREFIX_BIGTABLEKEY+i]} = detail.${MODEL_LIST_COLUMN_PREFIX_BIGTABLEKEY+i}`);
  }
  sqlJoin.push(`INNER JOIN ${bigTable} big_table ON ${innerJoin.join(' AND ')}`);

  // sqlSelect = sqlSelect.concat(downloadFeatureIds);

  //set where criteria
  sqlWhere = sqlWhere.concat(['detail.mdID = @mdId', 'detail.batID = @batId', 'detail.mdListCateg = @mdListCateg']);
  request
    .setInput('mdId', TYPES.NVarChar, mdId)
    .setInput('batId', TYPES.NVarChar, batId)
    .setInput('mdListCateg', TYPES.NVarChar, criteriaHelper.MODEL_LIST_CATEGORY);

  //set customized criteria
  //transfer input criteria to sql expression
  let {customCriteriaSqlWhere, paramsDynamic} = criteriaHelper.inputCriteriaToSqlWhere(statements);
  // winston.info('queryTargetByCustomCriteria::customCriteriaSqlWhere: %s', customCriteriaSqlWhere);
  if(customCriteriaSqlWhere) {
    sqlWhere.push(customCriteriaSqlWhere);
    // sqlWhere = `${sqlWhere} AND ${customCriteriaSqlWhere}`;
    request = _.reduce(paramsDynamic, (request, {name, type, value}) => {
      return request.setInput(name, RDB_DATATYPE(type), value);
    }, request);
  }

  //customizer handler
  customizer.map(handler => {
    let {select, reduction, join, where, sort, parameters} = handler();
    sqlSelect = sqlSelect.concat(select || []);
    sqlReduction = sqlReduction.concat(reduction || []);
    sqlJoin = sqlJoin.concat(join || []);
    sqlWhere = sqlWhere.concat(where || []);
    sqlSort = sqlSort.concat(sort || []);
    // !_.isEmpty(select) && (sqlSelect = ` ${sqlSelect}, ${select} `);
    // !_.isEmpty(from) && (sqlFrom = ` ${sqlFrom}, ${from} `);
    // !_.isEmpty(where) && (sqlWhere = ` AND ${sqlWhere} AND ${where} `);
    request = _.reduce(parameters, (request, {name, type, value}) => {
      return request.setInput(name, type, value);
    }, request);
  });

  //compose all the partial sql to full sql
  let sql =
    `SELECT ${sqlReduction.join(' ')} ${sqlSelect.join(' , ')} ` +
    `FROM ${sqlFrom.join(' , ')} ${sqlJoin.join(' ')} ` +
    `WHERE ${sqlWhere.join(' AND ')} ` +
    `ORDER BY ${sqlSort.join(' , ')}`;
  winston.info('queryTargetByCustomCriteria::sql: %s', sql);

  //execute query
  Q.nfcall(request.executeQuery, sql).then((result) => {
    // winston.info('===queryTargetByCustomCriteria::executeQuery::result: ', result);
    callback(null, result);
  }).fail((err) => {
    winston.error('===criteria-service::queryTargetByCustomCriteria(%j) failed: ',
      {mdId, batId, statements, model, downloadFeatureIds}, err);
    callback(err);
  });
};

module.exports.getCriteriaHistoryList = (callback) => {};
module.exports.getCriteriaHistory = (id, callback) => {
  callback(null, {
    expression: test_data.criteria[id],
    isIncludeModelTarget: false
  });
};