import React from 'react';
import {map} from 'lodash';
import CriteriaBaseBodyContainerMute from './CriteriaBaseBodyContainerMute';
import CriteriaComboBundleMute from "./CriteriaComboBundleMute";

const STEP_TITLE = {
  client: '顧客屬性條件',
  vehicle: '車輛屬性條件',
  transaction: '明細資料指定條件',
  tag: '標籤條件',
  trail: '線上足跡'
};

export default class CriteriaOverview extends React.PureComponent {
  render() {
    return (
      <div className="table-responsive">
        {map(this.props.criteria, (value, key) => {
          return (
            <div key={key}>
              <h3>{STEP_TITLE[key]}</h3>
              {/* 條件設定 預覽狀態*/}
              <CriteriaBaseBodyContainerMute criteria={value}
                                             ComponentCriteriaBundleContainer={CriteriaComboBundleMute}/>
            </div>
          );
        })}
      </div>
    );
  };
};