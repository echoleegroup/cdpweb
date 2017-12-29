import React from 'react';

export default class CriteriaPreviewEmpty extends React.PureComponent {
  render() {
    return (
      <div className="table_block">
        <h2>名單條件設定</h2>
        <div className="nocondition">{/*<!-- 無條件設定 -->*/}
          <p>無條件設定</p>
        </div>
        <div className="btn-block center-block">
          <button type="submit" className="btn btn-lg btn-default" onClick={() => {
            this.props.switchToEditMode();
          }}>編輯條件</button>
        </div>
      </div>
    );
  };
}