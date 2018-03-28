import React from 'react';
import {isEmpty, reduce} from 'lodash';
import IntegratedAnalysisAction from "../actions/integrated-analysis-action";
import IntegratedAnalysisCriteriaBase from "./IntegratedAnalysisCriteriaBase";
import {CRITERIA_COMPONENT_DICT} from "../utils/criteria-dictionary";

export default class IntegratedAnalysisCriteriaClient extends IntegratedAnalysisCriteriaBase {
  constructor(props) {
    super(props);
  };

  validate() {
    const MAIN_TARGET_FINDER = (criteria) => {
      if (isEmpty(criteria)) {
        return false;
      }

      reduce(criteria, (isFound, c) => {
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

    return MAIN_TARGET_FINDER(this.state.criteria);
  };

  subheadText() {
    return '第一步 挑選顧客屬性資料';
  };

  fetchPreparedData(props, _this, callback) {
    IntegratedAnalysisAction.getClientCriteriaFeatures(callback);
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