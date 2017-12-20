import React from 'react';
import {List} from 'immutable';
import PreferredTargetCriteriaConfig from './PreferredTargetCriteriaConfig';
import PreferredTargetCriteriaPreview from './PreferredTargetCriteriaPreview';

export default class PreferredTargetCriteria extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      preview: true,
      criteria: List([])
    }
  };

  render() {
    return (
      <div className="table_block">{/*<!-- table set Start -->*/}
        <h2>名單條件設定</h2>
        {/*<!-- 條件設定 預覽狀態-->*/}
        <PreferredTargetCriteriaPreview criteria={this.state.criteria}/>
        {/*<!-- 條件設定 編輯狀態-->*/}
        <PreferredTargetCriteriaConfig criteria={this.state.criteria}/> />
        <div className="btn-block center-block">
          <button type="submit" className="btn btn-lg btn-default">編輯條件</button>
          <button type="submit" className="btn btn-lg btn-default">下一步</button>
        </div>
      </div>
    );
  };
}