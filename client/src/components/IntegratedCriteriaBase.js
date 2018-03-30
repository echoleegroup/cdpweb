import React from 'react';
import ModalCriteriaSetter from './ModalCriteriaSetter';
import CriteriaBase from "./CriteriaBase";

export default class IntegratedCriteriaBase extends CriteriaBase {
  headlineText() {
    return '查詢條件';
  };

  ComponentPreviewControlButton() {
    return (
      <div className="btn-block center-block">
        <button type="button" className="btn btn-lg btn-default" onClick={this.props.stepPrev}>上一步</button>
        <button type="button" className="btn btn-lg btn-default" onClick={this.toEdit}>編輯條件</button>
        <button type="button" className="btn btn-lg btn-default" onClick={this.props.stepNext}>下一步</button>
      </div>
    );
  };
};