import React from 'react';
import {reject} from 'lodash';
import shortid from 'shortid';
import {default as constants} from '../utils/constants';
import CriteriaField from './CriteriaField';

export default class CriteriaBundle extends React.PureComponent {
  constructor(props, type) {
    super(props);
    //console.log('CriteriaBundle props.criteria: ', props.criteria);
    this.state = Object.assign({
      key: shortid.generate(),
      type: type || 'bundle',  //combo, ref, field
      operator: 'and',  //and, or, eq, ne, lt, le, gt, ge, not
      criteria: []
    }, props.criteria);
    this.OPTIONS = ['and', 'or'];
  };

  componentWillUnmount() {
    console.log('CriteriaBundle: componentWillUnmount', this.state.key);
  };

  render() {
    let mapToProps = {
      isPreview: this.props.isPreview,
      foldingFields: this.props.foldingFields,
      refOptions: this.props.refOptions,
      refFields: this.props.refFields,
      refFolds: this.props.refFolds
    };

    return this._render(mapToProps, this);
  };

  _render(mapToProps, _that) {
    return (
      <div>
        {/*<!-- head -->*/}
        <div className="head">
          以下條件
          <select className="form-control" defaultValue={_that.state.operator} disabled={_that.props.isPreview}>
            {
              _that.OPTIONS.map((key) => {
                return <option value={key} key={key}>{constants.PREFERRED_OPERATOR[key]}</option>;
              })
            }
          </select>符合
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
    //console.log('CriteriaBundle criteria.type: ', criteria.type);
    switch(criteria.type) {
      case 'field':
        let removeCriteria = this.removeCriteria.bind(this);
        return <CriteriaField key={criteria.key} criteria={criteria} {...mapToProps} removeCriteria={removeCriteria}/>;
      default:
        return <div key={criteria.key}/>;
        //return <CriteriaField key={criteria.key} criteria={criteria} {...mapToProps} removeCriteria={removeCriteria}/>;
    }
  };

  ControlButton() {
    if (!this.props.isPreview) {
      return (
        <div className="add_condition">{/*<!-- 加條件 條件組合 -->*/}
          <button type="submit" className="btn btn-warning"><i className="fa fa-plus" aria-hidden="true"/>加條件</button>
        </div>
      );
    }
  };

  removeCriteria(key) {
    this.setState({
      criteria: reject(this.state.criteria, {
        key: key
      })
    });
  }

  getCriteria() {
    if (this.state.criteria.size() === 0) {
      return [];
    } else {
      //return this.state;
    }
  };
};
