import React from 'react';
import {isEmpty, reduce} from 'lodash';
import {getClientCriteriaFeatures} from "../actions/integrated-analysis-action";
import IntegratedCriteriaBase from "./IntegratedCriteriaBase";
import {CRITERIA_COMPONENT_DICT} from "../utils/criteria-dictionary";
import shrotid from "shortid";

export default class IntegratedCriteriaClient extends IntegratedCriteriaBase {
  constructor(props) {
    super(props);
    if (isEmpty(this.state.criteria)) {
      this.state.criteria.push({
        id: shrotid.generate(),
        operator: "and",
        ref: null,
        ref_label: null,
        type: "combo",
        criteria: [{
          data_type: "text",
          field_id: "MAIN_TARGET",
          field_label: "對象別",
          id: shrotid.generate(),
          input_type: "refOption",
          operator: "eq",
          ref: "CMMCODEFILE-25",
          type: "field",
          value: ["2"],
          value_label: ["使用人"]
        }]
      });
    }
  };

  validate(criteria) {
    const MAIN_TARGET_FINDER = (criteria) => {
      if (isEmpty(criteria)) {
        return false;
      }

      return reduce(criteria, (isFound, c) => {
        if (isFound) {
          return true;
        }
        switch (c.type) {
          case CRITERIA_COMPONENT_DICT.FIELD:
            return isFound || 'MAIN_TARGET' === c.field_id;
          default:
            return isFound || MAIN_TARGET_FINDER(c.criteria)
        }
      }, false)
    };

    let isFound = MAIN_TARGET_FINDER(criteria);
    if (!isFound) {
      this.setState({
        message_error: '必須指定對象別條件'
      });
    } else {
      return isFound;
    }
  };

  subheadText() {
    return '第一步 挑選顧客屬性資料';
  };

  fetchPreparedData(callback) {
    getClientCriteriaFeatures(data => {
      callback({
        features: data.features,
        featureRefCodeMap: data.featureRefCodeMap
      });
    });
  };

  ComponentPreviewControlButton() {
    return (
      <div className="btn-block center-block">
        <button type="button" className="btn btn-lg btn-default" onClick={this.toEdit}>編輯條件</button>
        <button type="button" className="btn btn-lg btn-default" onClick={this.props.stepNext}>下一步</button>
      </div>
    );
  };
};