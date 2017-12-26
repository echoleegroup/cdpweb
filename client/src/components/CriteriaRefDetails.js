import React from 'react';
import {default as constants} from '../utils/constants';
import CriteriaField from './CriteriaField';
import {default as _test} from '../../test/preferred-criteria-test'

export default class CriteriaRef extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = Object.assign({
      type: 'ref',
      operator: 'and',
      criteria: []
    }, props.criteria);

    this.refs = _test.refs;
  };

  getCriteria() {
    if(this.state.criteria.size() === 0) {
      return [];
    } else {
      //return this.state;
    }
  };

  render() {
    const OPTIONS = ['and', 'or', 'not'];

    return (
      <div className="level form-inline">
        {/*<!-- head -->*/}
        <div className="head">
          以下的明細條件
          <select className="form-control" defaultValue={this.state.operator} disabled={this.props.isPreview}>
            {
              OPTIONS.map((key) => {
                return <option value={key} key={key}>{constants.PREFERRED_OPERATOR[key]}</option>;
              })
            }
          </select>符合
        </div>
        {/*<!-- 第二層 -->*/}
        <div className="level form-inline">
          {this.state.criteria.map((_criteria, index) => {
            return this.BundleContent(_criteria, index);
          })}
        </div>
        {this.ControlButton()}
      </div>
    );
  };
};