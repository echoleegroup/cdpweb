import React from 'react';
import CriteriaBaseBodyContainerMute from './CriteriaBaseBodyContainerMute';
import CriteriaComboBundleMute from "./CriteriaComboBundleMute";

export default class IntegratedAnalysisCriteriaPreview extends React.PureComponent {
  render() {
    return (
      <div className="table_block">
        <h2>查詢條件</h2>
        <h3>第六步 條件總覽</h3>
        <div className="preview">
          <h4>將取出符合以下所有條件的顧客資料</h4>
          <h4><i className="fa fa-check" aria-hidden="true"/>顧客屬性條件</h4>
          {/*<p className="customer">顧客對象別：<span>使用人</span></p>*/}
          {/* 條件設定 預覽狀態*/}
          <CriteriaBaseBodyContainerMute criteria={this.props.criteria.get(this.props.STEPS.step1)}
                                 ComponentCriteriaBundleContainer={CriteriaComboBundleMute}/>

          <h4><i className="fa fa-check" aria-hidden="true"/>車輛屬性條件</h4>
          {/* 條件設定 預覽狀態*/}
          <CriteriaBaseBodyContainerMute criteria={this.props.criteria.get(this.props.STEPS.step2)}
                                 ComponentCriteriaBundleContainer={CriteriaComboBundleMute}/>

          <h4><i className="fa fa-check" aria-hidden="true"/>明細資料指定條件</h4>
          {/* 條件設定 預覽狀態*/}
          <CriteriaBaseBodyContainerMute criteria={this.props.criteria.get(this.props.STEPS.step3)}
                                 ComponentCriteriaBundleContainer={CriteriaComboBundleMute}/>

          <h4><i className="fa fa-check" aria-hidden="true"/>標籤條件</h4>
          {/* 條件設定 預覽狀態*/}
          <CriteriaBaseBodyContainerMute criteria={this.props.criteria.get(this.props.STEPS.step4)}
                                         ComponentCriteriaBundleContainer={CriteriaComboBundleMute}/>

        </div>
        <div className="btn-block center-block">
          <button type="submit" className="btn btn-lg btn-default" onClick={this.props.stepNext}>挑選下載欄位</button>
        </div>
      </div>
    );
  };
};