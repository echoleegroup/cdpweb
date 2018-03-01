'use strict';
const winston = require('winston');
const API_360_HOST = require("../app-config").get("API_360_HOST");
const API_360_PORT = require("../app-config").get("API_360_PORT");
module.exports.transService = (queryId, JObject, callback) => {
  let transJson = new Object();

  //開始組select json
  let selectInfo = [];
  let postWhere = [];
  let column;
  let filter;
  let filterObject = new Object();
  //先組Master 
  column = JObject.export.master.features;
  selectInfo.push({
    "type": "master",
    "column": column
  })

  //組filter(master)
  filter = JObject.export.master.filter;
  filterObject = getPostWhere(filter, "master");
  postWhere.push(filterObject);

  //開始組其他select欄位
  let keys = Object.keys(JObject.export.relatives);
  for (let i = 0; i < keys.length; i++) {
    column = JObject.export.relatives[keys[i]].features;
    selectInfo.push({
      "type": keys[i],
      "column": column
    });

    //組filter(其他)
    filter = JObject.export.relatives[keys[i]].filter;
    filterObject = getPostWhere(filter, keys[i]);
    postWhere.push(filterObject);
  }


  //開始組where條件
  let whereArray = [];
  whereArray = getWhere(JObject.criteria);

  transJson.select = selectInfo;
  transJson.where = whereArray;
  transJson.postWhere = postWhere;
  console.log(JSON.stringify(transJson));

  //呼叫API
  
  let request = require('request');
  let url = "http://" + API_360_HOST + ":" + API_360_PORT + "/query/" + queryId
  request({
    url: url,
    method: "POST",
    json: true,
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify(transJson)
  }, function (error, response, body) {
    if (error)
      callback(error, null);
    else if (!error && response.statusCode == 200)
      callback(null, transJson);
  });
  
 

  function getWhere(Jdata) {
    let whereArray = [];
    //客戶明細
    let clientObject = new Object();
    let clientArray = [];
    let clientJSON = Jdata.client;
    console.log('clientJSON: ', clientJSON);
    let getClientWhere = getCombo(clientJSON[0]);
    clientArray.push(getClientWhere);
    clientObject.type = "master";
    clientObject.condition = clientArray;
    whereArray.push(clientObject);

    //車子明細
    let vehicleObject = new Object();
    let vehicleArray = [];
    let vehicleJSON = Jdata.vehicle;
    let getVehicleWhere = getCombo(vehicleJSON[0]);
    vehicleArray.push(getVehicleWhere);
    vehicleObject.type = "master";
    vehicleObject.condition = vehicleArray;
    whereArray.push(vehicleObject);

    //交易明細
    let transactionObject = new Object();
    let transactionArray = [];
    let transactionJSON = Jdata.transaction;
    let getTransactionWhere = getCombo(transactionJSON[0]);
    transactionArray.push(getTransactionWhere);
    transactionObject.type = "ismain";
    transactionObject.condition = transactionArray;
    whereArray.push(transactionObject);
    return whereArray;
  }
  function getCombo(Jdata) {
    if (Jdata.type == "combo") {
      let ComboObject = new Object();
      let children = [];
      for (let i in Jdata.criteria) {
        children.push(getContent(Jdata.criteria[i], Jdata.operator));
      }
      ComboObject.children = children;
      ComboObject.relation = Jdata.operator;
      //console.log(ComboObject);
      return ComboObject;
    }

  }
  function getContent(Jdata, operator) {
    if (Jdata.type == "refTransaction" || Jdata.type == "bundle") {
      let complexObejct = new Object();
      let children = [];
      for (let i in Jdata.criteria) {
        children.push(getField(Jdata.criteria[i], Jdata.operator));
      }
      complexObejct.relation = operator;
      complexObejct.children = children;
      return complexObejct;
    }
    else {
      return getField(Jdata, operator);
    }

  }
  function getOperator(operator) {
    if (operator == "eq")
      return "=";
    else if (operator == "ne")
      return "!=";
    else if (operator == "lt")
      return ">";
    else if (operator == "le")
      return "<";
    else if (operator == "gt")
      return ">=";
    else if (operator == "ge")
      return "<=";
    else if (operator == "in")
      return "in";
    else if (operator == "ni")
      return "not in";
  }
  function getExpr(JField) {
    let fieldOperator = getOperator(JField.operator);
    let returnValue = fieldOperator + " ";
    if (!JField.ref) {
      if (fieldOperator == "in" || fieldOperator == "not in") {
        returnValue += "(";
        let label = JField.value_label;
        let value = JField.value;
        for (let i = 0; i < label.length; i++) {
          if (!isNaN(Date.parse(label[i]))) {
            if (i == label.length - 1)
              returnValue += "'" + label[i].replace(/\//g,"") + "',";
            else
              returnValue += "'" + label[i].replace(/\//g,"") + "')";
          }
          else {
            if (i == label.length - 1)
              returnValue += "'" + value[i] + "',";
            else
              returnValue += "'" + value[i] + "')";
          }
        }
      }
      else {
        let label = JField.value_label;
        let value = JField.value;
        if (!isNaN(Date.parse(label)))
          returnValue += "'" + label.replace(/\//g,"") + "'";
        else
          returnValue += "'" + value + "'";
      }
    }
    else {
      if (fieldOperator == "in" || fieldOperator == "not in") {
        returnValue += "(";
        let label = JField.value_label;
        let value = JField.value;
        if (!isNaN(Date.parse(label)))
          returnValue += "'" + label.replace(/\//g,"") + "')";
        else
          returnValue += "'" + value + "')";
      }
      else {
        let label = JField.value_label;
        let value = JField.value;
        if (!isNaN(Date.parse(label)))
          returnValue += "'" + label.replace(/\//g,"") + "'";
        else
          returnValue += "'" + value + "'";
      }
    }
    return returnValue;
  }
  function getField(JField, operator) {
    let fieldObject = new Object();
    fieldObject.relation = operator;
    fieldObject.column = JField.field_id;
    fieldObject.expr = getExpr(JField);
    return fieldObject;
  }

  function getPostWhere(Jdata, source) {
    let object = new Object();
    object.type = source;
    let conditionArray = [];
    let count = getCount(Jdata);
    if (count > 0) {
      conditionArray.push(getPostWhereField(Jdata.feature, Jdata.period_start_label, ">="));
      conditionArray.push(getPostWhereField(Jdata.feature, Jdata.period_end_label, "<="));
    }
    object.condition = conditionArray;
    return object;

  }
  function getCount(Jdata) {
    let count = Object.keys(Jdata).length;
    return count;
  }
  function getPostWhereField(feature, label, operator) {
    let postWhereObject = new Object();
    postWhereObject.relation = "and";
    postWhereObject.column = feature;
    postWhereObject.expr = operator + "'" + label.replace(/\//g,"") + "'";
    return postWhereObject;
  }
};
