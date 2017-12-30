import React from 'react';
import CriteriaView from '../CriteriaView';
//import CriteriaPreviewEmpty from './CriteriaPreviewEmpty'

export default class CriteriaPreview extends CriteriaView {
  ControlButtonRender() {
    return (
      <div className="btn-block center-block">
        <button type="button" className="btn btn-lg btn-default" onClick={() => {
          this.props.doEdit();
        }}>編輯條件</button>
      </div>
    );
  }
};