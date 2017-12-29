import React from 'react';
import CriteriaPreview from './CriteriaPreview';

export default class CriteriaPreviewEmpty extends CriteriaPreview {
  getBodyStyleClass() {
    return 'nocondition';
  };

  CriteriaBody() {
    return (
      <p>無條件設定</p>
    );
  }
}