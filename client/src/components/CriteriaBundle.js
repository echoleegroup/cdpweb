import React from 'react';
import {List} from 'immutable';
import {isEmpty, reduce} from 'lodash';
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
    this.state = this.getInitialState(options, props.criteria);
    //this.state = Object.assign({}, this.getInitialState(options), props.criteria);
    // console.log('CriteriaBundle::constructor: ', this.state.get('uuid'));
  };

  getInitialState(options = {}, injection = {}) {
    // console.log('CriteriaBundle::getInitialState::injection.criteria: ', injection);
    const state = {
      type: 'bundle',  //combo, ref, field
      operator: 'and',  //and, or, eq, ne, lt, le, gt, ge, not
      criteria: List()
    };

    return Object.assign({}, state, {
      uuid: shortid.generate(),
      type: injection.type || options.type || state.type,
      operator: injection.operator || options.operator || state.operator,
      criteria: state.criteria.concat(options.criteria || [], injection.criteria || [])
    });
  };

  componentWillMount() {
    console.log('CriteriaBundle: componentWillMount: ', this.state);
    this.criteriaComponents = {};

    this.collectCriteriaComponents = (uuid, component) => {
      // console.log('CriteriaBundle::componentWillMount::collectCriteriaComponents:: ', component);
      this.criteriaComponents[uuid] = component;
    };

    this.removeCriteriaComponents = (uuid) => {
      console.log('CriteriaBundle::removeCriteriaComponents: ', uuid);
      delete this.criteriaComponents[uuid];
      // console.log('CriteriaBundle::removeCriteriaComponents: ', component);
      // let index = indexOf(this.criteriaComponents, component);
      // console.log('CriteriaBundle::removeCriteriaComponents::findIndex ', index);
      // this.criteriaComponents.splice(index, 1);
      // console.log('CriteriaBundle::removeCriteriaComponents: ', this.criteriaComponents);
    };

    this.getCriteria = () => {
      console.log('CriteriaBundle::getCriteria: ', this.criteriaComponents);
      let subCrits = reduce(this.criteriaComponents, (collector, comp, uuid) => {
        let crite = comp.getCriteria(); //immutable Map
        // console.log('CriteriaBundle::getCriteria::crite ', crite);
        return isEmpty(crite)? collector: collector.push(crite);
      }, List());

      console.log('CriteriaBundle::getCriteria::subCrits ', subCrits);
      return (subCrits.size === 0)? {}: Object.assign({}, this.state, {
        criteria: subCrits
      });
    };

    this.setCriteria = (criteria) => {
      // console.log('CriteriaBundle:setCriteria: ', criteria);
      this.setState((prevState) => {
        return {
          criteria: prevState.criteria.push(criteria)
        };
      });
    };

    this.removeCriteria = (index) => {
      this.setState((prevState) => {
        // console.log('CriteriaBundle:removeCriteria: ', prevState);
        // console.log('CriteriaBundle:removeCriteria: ', prevState.get('criteria'));
        return {
          criteria: prevState.criteria.delete(index)
        };
      });
    };

    this.props.collectCriteriaComponents(this.state.uuid, this);
  };

  componentWillUpdate(nextProps, nextState) {
    console.log('CriteriaBundle: componentWillUpdate: ', nextState);
  };

  componentWillUnmount() {
    console.log('CriteriaBundle: componentWillUnmount: ', this.state);
    this.props.removeCriteriaComponents(this.state.uuid);
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
    // console.log('CriteriaBundle::CriteriaHead');
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
    // console.log('CriteriaOperatorSelector::CriteriaBundle: ', typeof this.state);
    return (
      <select className="form-control"
              defaultValue={this.state.operator}
              disabled={this.props.isPreview}
              onChange={(e) => {
                this.setState({
                  operator: e.target.value
                });
      }}>
        {
          Object.keys(this.OPERATOR_DICT).map((key) => {
            return <option value={key} key={key}>{this.OPERATOR_DICT[key]}</option>;
          })
        }
      </select>
    );
  };

  ChildCriteriaBlock() {
    return (
      <div className="level form-inline">
        {this.state.criteria.map((_criteria, index) => {
          return this.ChildCriteria(_criteria, index);
        })}
      </div>
    );
  };

  ChildCriteria(criteria, index) {
    // console.log('CriteriaBundle::ChildCriteria: ', criteria);
    switch(criteria.type) {
      case 'field':
        return <CriteriaField key={criteria.uuid} {...this.props}
                              criteria={criteria}
                              index={index}
                              removeCriteria={this.removeCriteria}
                              collectCriteriaComponents={this.collectCriteriaComponents}
                              removeCriteriaComponents={this.removeCriteriaComponents}
                              /*
                              ref={(e) => {
                                if(e) this.collectCriteriaComponents(criteria.uuid, e);
                                else this.removeCriteriaComponents(criteria.uuid);
                              }}*//>;
      default:
        return <div key={criteria.uuid}/>;
    }
  };

  ControlButton() {
    if (!this.props.isPreview) {
      return (
        <div className="add_condition">{/*<!-- 加條件 條件組合 -->*/}
          <button type="button" className="btn btn-warning" onClick={() => {
            this.props.addCriteriaField(this.setCriteria);
          }}><i className="fa fa-plus" aria-hidden="true"/>加條件</button>
        </div>
      );
    }
  };
};
