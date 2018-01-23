import React from 'react';
import {List} from 'immutable';
import {isEmpty, reduce, assign} from 'lodash';
import shortid from 'shortid';
import CriteriaField from './CriteriaField';

const OPERATOR_OPTIONS = {
  and: '全部',
  or: '任一'
};

export default class CriteriaBundle extends React.PureComponent {
  constructor(props, options) {
    super(props);
    this.OPERATOR_OPTIONS = options.OPERATOR_OPTIONS || OPERATOR_OPTIONS;
    this.state = this.getInitialState(options, props.criteria);
  };

  getInitialState(options = {}, injection = {}) {
    // console.log('CriteriaBundle::getInitialState::injection.criteria: ', injection);
    const state = {
      type: 'bundle',  //combo, ref, field
      operator: 'and',  //and, or, eq, ne, lt, le, gt, ge, not
      ref: null,
      ref_label: null,
      criteria: List()
    };

    return assign({}, state, {
      uuid: injection.uuid || shortid.generate(),
      type: injection.type || options.type || state.type,
      operator: injection.operator || options.operator || state.operator,
      ref: injection.ref || options.ref || state.ref,
      ref_label: injection.ref_label || options.ref_label || state.ref_label,
      criteria: state.criteria.concat(options.criteria || [], injection.criteria || [])
    });
  };

  componentWillMount() {
    // console.log('CriteriaBundle: componentWillMount: ', this.state);
    this.criteriaComponents = {};

    this.collectCriteriaComponents = (uuid, component) => {
      // console.log('CriteriaBundle::componentWillMount::collectCriteriaComponents:: ', component);
      this.criteriaComponents[uuid] = component;
    };

    this.removeCriteriaComponents = (uuid) => {
      // console.log('CriteriaBundle::removeCriteriaComponents: ', uuid);
      delete this.criteriaComponents[uuid];
      // console.log('CriteriaBundle::removeCriteriaComponents: ', component);
      // let index = indexOf(this.criteriaComponents, component);
      // console.log('CriteriaBundle::removeCriteriaComponents::findIndex ', index);
      // this.criteriaComponents.splice(index, 1);
      // console.log('CriteriaBundle::removeCriteriaComponents: ', this.criteriaComponents);
    };

    this.criteriaGathering = () => {
      // console.log('CriteriaBundle::criteriaGathering: ', this.state.type, this.criteriaComponents);
      let subCrits = reduce(this.criteriaComponents, (collector, comp, uuid) => {
        let crite = comp.criteriaGathering(); //immutable Map
        // console.log('CriteriaBundle::criteriaGathering::crite ', crite);
        return isEmpty(crite)? collector: collector.push(crite);
      }, []);

      // console.log('CriteriaBundle::criteriaGathering::subCrits ', subCrits);
      return (subCrits.length === 0)? {}: assign({}, this.state, {
        criteria: subCrits
      });
    };

    this.setCriteria = (criteria) => {
      console.log('CriteriaBundle:setCriteria: ', criteria);
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
    // console.log('CriteriaBundle: componentWillUpdate: ', nextState);
  };

  componentWillUnmount() {
    console.log('CriteriaBundle::componentWillUnmount: ', this.state);
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
          Object.keys(this.OPERATOR_OPTIONS).map((key) => {
            return <option value={key} key={key}>{this.OPERATOR_OPTIONS[key]}</option>;
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
                              removeCriteriaComponents={this.removeCriteriaComponents}/>;
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
