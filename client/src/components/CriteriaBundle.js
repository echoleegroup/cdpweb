import React from 'react';
import {reject, isEmpty} from 'lodash';
import shortid from 'shortid';
import CriteriaField from './CriteriaField';

const OPERATOR_DICT =  Object.assign({}, {
  and: '全部',
  or: '任一'
});

export default class CriteriaBundle extends React.PureComponent {
  constructor(props, options) {
    super(props);
    this.OPERATOR_DICT = OPERATOR_DICT;
    this.state = Object.assign({}, this.getInitialState(options), props.criteria);
    console.log('CriteriaBundle::constructor: ', this.state.uuid);
  };

  getInitialState(options = {}) {
    const state = {
      type: 'bundle',  //combo, ref, field
      operator: 'and',  //and, or, eq, ne, lt, le, gt, ge, not
      criteria: []
    };

    return Object.assign(state, {
      uuid: shortid.generate(),
      type: options.type || state.type,
      operator: options.operator || state.operator
    });
  };

  componentWillMount() {
    let _this = this;
    _this.getCriteria = () => {
      let subCrits = _this.criteriaComponents.reduce((collector, comp) => {
        let crite = comp.getCriteria();
        return isEmpty(crite)? collector: collector.concat(crite);
      }, []);

      return isEmpty(subCrits)? {}: Object.assign(_this.state, {
        criteria: subCrits
      });
    };
  };

  componentWillUpdate(nextProps, nextState) {
    console.log('CriteriaBundle: componentWillUpdate: ', nextState.uuid);
  };

  componentWillUnmount() {
    console.log('CriteriaBundle: componentWillUnmount: ', this.state.uuid);
  };

  render() {
    return (
      <div>
        {/*<!-- head -->*/}
        {this.CriteriaHead()}
        {/*<!-- 第二層 -->*/}
        {this.ChildCriteriaBlock()}
        {this.ControlButton()}
      </div>
    );
  }

  CriteriaHead() {
    console.log('CriteriaBundle::CriteriaHead')
    return (
      <div className="head">
        以下條件{this.CriteriaOperatorSelector()}符合
        {this.CriteriaHeadTail()}
      </div>
    );
  };

  CriteriaHeadTail() {
    return null;
  };

  CriteriaOperatorSelector() {
    return (
      <select className="form-control" defaultValue={this.state.operator} disabled={this.props.isPreview}>
        {
          Object.keys(this.OPERATOR_DICT).map((key) => {
            return <option value={key} key={key}>{this.OPERATOR_DICT[key]}</option>;
          })
        }
      </select>
    );
  };

  ChildCriteriaBlock() {
    this.criteriaComponents = [];
    return (
      <div className="level form-inline">
        {this.state.criteria.map((_criteria) => {
          return this.ChildCriteria(_criteria);
        })}
      </div>
    );
  };

  ChildCriteria(criteria) {
    console.log('CriteriaBundle::ChildCriteria: ', criteria);
    switch(criteria.type) {
      case 'field':
        return <CriteriaField key={criteria.uuid} {...this.props}
                              criteria={criteria}
                              removeCriteria={this.removeCriteria.bind(this)}
                              ref={(e) => {
                                e && this.criteriaComponents.push(e);
                              }}/>;
      default:
        return <div key={criteria.uuid}/>;
    }
  };

  ControlButton() {
    if (!this.props.isPreview) {
      return (
        <div className="add_condition">{/*<!-- 加條件 條件組合 -->*/}
          <button type="button" className="btn btn-warning" onClick={() => {
            this.props.addCriteriaField(this.setCriteria.bind(this));
          }}><i className="fa fa-plus" aria-hidden="true"/>加條件</button>
        </div>
      );
    }
  };

  setCriteria(criteria) {
    console.log('CriteriaBundle:setCriteria: ', criteria);
    this.setState((prevState) => {
      return Object.assign({}, prevState, {
        criteria: prevState.criteria.concat(criteria)
      });
    });
  };

  removeCriteria(key) {
    console.log('CriteriaBundle:removeCriteria: ', this.state.uuid);
    this.setState({
      criteria: reject(this.state.criteria, {
        uuid: key
      })
    });
  }
};
