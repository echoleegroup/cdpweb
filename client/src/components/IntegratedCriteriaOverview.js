import React from 'react';
import CriteriaOverview from "./CriteriaOverview";

export default class IntegratedCriteriaOverview extends React.PureComponent {
  render() {
    let step = this.props.STEPS;
    let immutableCriteria = this.props.criteria;
    let criteria = {
      [step.step1]: immutableCriteria.get(step.step1),
      [step.step2]: immutableCriteria.get(step.step2),
      [step.step3]: immutableCriteria.get(step.step3),
      [step.step4]: immutableCriteria.get(step.step4),
      [step.step5]: immutableCriteria.get(step.step5)
    };

    return (
      <div className="table_block">
        <h2>查詢條件</h2>
        <h3>第六步 條件總覽</h3>
        <CriteriaOverview criteria={criteria}/>
        <div className="btn-block center-block">
          <button type="submit" className="btn btn-lg btn-default" onClick={this.props.stepNext}>挑選下載欄位</button>
        </div>
      </div>
    );
  };
};