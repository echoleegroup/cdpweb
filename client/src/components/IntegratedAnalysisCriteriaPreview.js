import React from 'react';
import {isEmpty} from 'lodash';
import CriteriaBaseBodyContainer from './CriteriaBaseBodyContainer';
import CriteriaComboBundleList from './CriteriaComboBundleList'
import CriteriaComboBundle from "./CriteriaComboBundle";
import CriteriaTransactionBundleMute from "./CriteriaTransactionBundleMute";

const ComponentCriteriaBody = (props) => {
  let mapToProps = {};
  if (isEmpty(props.criteria)) {
    mapToProps = {
      styleClass: 'nocondition',
      ComponentCriteriaBody: (<p>無條件設定</p>)
    };
  } else {
    mapToProps = {
      styleClass: 'condition',
      ComponentCriteriaBody: ComponentContentBody
    };
  }
  return <CriteriaBaseBodyContainer {...mapToProps}/>
};

const ComponentContentBody = (props) => {
  return (
    <div className="level form-inline">
      <CriteriaComboBundleList
        isPreview={true}
        criteria={props.criteria}
        ComponentCriteriaBundleContainer={props.ComponentCriteriaBundleContainer}/>
    </div>
  );
};

export default class IntegratedAnalysisCriteriaPreview extends React.PureComponent {
  render() {
    return (
      <div className="table_block">
        <h2>查詢條件</h2>
        <h3>第六步 條件總覽</h3>
        <div className="preview">
          <h4>將取出符合以下所有條件的顧客資料</h4>
          <h4><i className="fa fa-check" aria-hidden="true"/>顧客屬性條件</h4>
          <p className="customer">顧客對象別：<span>使用人</span></p>
          {/* 條件設定 預覽狀態*/}
          <ComponentCriteriaBody criteria={this.props.criteria.get(this.props.STEPS.step1)}
                                 ComponentCriteriaBundleContainer={CriteriaComboBundle}/>

          <h4><i className="fa fa-check" aria-hidden="true"/>車輛屬性條件</h4>
          {/* 條件設定 預覽狀態*/}
          <ComponentCriteriaBody criteria={this.props.criteria.get(this.props.STEPS.step2)}
                                 ComponentCriteriaBundleContainer={CriteriaComboBundle}/>

          <h4><i className="fa fa-check" aria-hidden="true"/>明細資料指定條件</h4>
          {/* 條件設定 預覽狀態*/}
          <ComponentCriteriaBody criteria={this.props.criteria.get(this.props.STEPS.step3)}
                                 ComponentCriteriaBundleContainer={CriteriaTransactionBundleMute}/>

        </div>
        <div className="btn-block center-block">
          <button type="submit" className="btn btn-lg btn-default" onClick={this.props.stepNext}>挑選下載欄位</button>
        </div>
      </div>
    );
  };
};