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
    else
      callback(null, transJson);
  });



  function getWhere(Jdata) {
    let whereArray = [];
    //客戶明細
    let clientJSON = Jdata.client;
    let masterObject = new Object();
    let masterArray = [];
    if (getCount(clientJSON) > 0) {
      let getClientWhere = getCombo(clientJSON[0]);
      masterArray.push(getClientWhere);
    }

    //車子明細
    let vehicleJSON = Jdata.vehicle;
    if (getCount(vehicleJSON) > 0) {
      let getVehicleWhere = getCombo(vehicleJSON[0]);
      masterArray.push(getVehicleWhere);
    }
    if (getCount(clientJSON) > 0 || getCount(vehicleJSON) > 0) {
      masterObject.type = "master";
      masterObject.condition = masterArray;
      whereArray.push(masterObject);
    }

    //交易明細
    let transactionJSON = Jdata.transaction;
    if (getCount(transactionJSON) > 0) {
      let transactionObject = new Object();
      let transactionArray = [];
      let getTransactionWhere = getCombo(transactionJSON[0]);
      transactionArray.push(getTransactionWhere);
      transactionObject.type = "ismain";
      transactionObject.condition = transactionArray;
      whereArray.push(transactionObject);
    }
    return whereArray;
  }
  function getCombo(Jdata) {
    if ("combo" === Jdata.type) {
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
    if ("refTransaction" === Jdata.type || "bundle" === Jdata.type) {
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
    if (operator === "eq")
      return "=";
    else if (operator === "ne")
      return "!=";
    else if (operator === "gt")
      return ">";
    else if (operator === "le")
      return "<=";
    else if (operator === "ge")
      return ">=";
    else if (operator === "lt")
      return "<";
    else if (operator === "in")
      return "IS NULL";
    else if (operator === "nn")
      return "IS NOT NULL";
  }
  function getExpr(JField) {
    let fieldOperator = getOperator(JField.operator);
    let returnValue = fieldOperator + " ";
    if (!JField.ref) {
      if ("IS NULL" != fieldOperator && "IS NOT NULL" != fieldOperator) {
        let label = JField.value_label;
        let value = JField.value;
        if (!isNaN(Date.parse(label)))
          returnValue += "'" + label.replace(/\//g, "") + "'";
        else
          returnValue += "'" + value + "'";
      }
    }
    else {
      if ("IS NULL" != fieldOperator && "IS NOT NULL" != fieldOperator) {
        let label = JField.value_label;
        let value = JField.value;
        if (!isNaN(Date.parse(label)))
          returnValue += "'" + label.replace(/\//g, "") + "'";
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
    postWhereObject.expr = operator + "'" + label.replace(/\//g, "") + "'";
    return postWhereObject;
  }
};
