import React from 'react';
import CriteriaView from './CriteriaView';

export default class CriteriaEdit extends CriteriaView {
  getBodyStyleClass() {
    return 'condition edit';
  };

  ControlButtonRender() {
    return (
      <div className="btn-block center-block">
        <button type="button" className="btn btn-lg btn-default" onClick={() => {
          let criteria = this.criteriaWrapper.getCriteria();
          console.log('CriteriaBase::CriteriaConfirm::onClick: ', criteria);
          this.props.doPreview(criteria);
        }}>完成編輯</button>
      </div>
    );
  }
};