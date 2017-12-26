import React from 'react';
import CriteriaBundle from './CriteriaBundle';
import {default as constants} from "../utils/constants";

export default class CriteriaDetailBundle extends CriteriaBundle {
  constructor(props) {
    super(props, 'refDetails');
  }

  componentWillUnmount() {
    console.log('CriteriaDetailBundle: componentWillUnmount', this.props.criteria.key);
  };

  render() {
    return super.render();
  }

  _render(mapToProps, _that) {
    // console.log('_that.props.refFolds: ', _that.props.refFolds);
    // console.log('_that.state.ref:', _that.state.ref);
    return (
      <div>
        {/*<!-- head -->*/}
        <div className="head">
          以下條件的明細記錄
          <select className="form-control" defaultValue={_that.state.operator} disabled={_that.props.isPreview}>
            {
              _that.OPTIONS.map((key) => {
                return <option value={key} key={key}>{constants.PREFERRED_OPERATOR[key]}</option>;
              })
            }
          </select>符合
          <div className="sub_conditon">
            指定參考：<span>{_that.props.refFolds[_that.state.ref].label}</span>
          </div>
        </div>
        {/*<!-- 第二層 -->*/}
        <div className="level form-inline">
          {_that.state.criteria.map((_criteria) => {
            return _that.BundleContent(_criteria, mapToProps);
          })}
        </div>
        {_that.ControlButton()}
      </div>
    );
  }

  BundleContent(criteria, mapToProps) {
    return super.BundleContent(criteria, mapToProps);
  };

  ControlButton() {
    return super.ControlButton();
  };
};