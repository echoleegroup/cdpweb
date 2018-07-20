import React from 'react';
import {List, Map} from 'immutable';
import {isEmpty, reduce, assign, map} from 'lodash';
import shortid from 'shortid';
import CriteriaField from './CriteriaField';
import {CRITERIA_COMPONENT_DICT} from '../utils/criteria-dictionary';
import CriteriaTag from "./CriteriaTag";

const OPERATOR_OPTIONS = {
  and: '全部',
  or: '任一'
};

export default class CriteriaBundle extends React.PureComponent {
  constructor(props) {
    super(props);
    this.OPERATOR_OPTIONS = OPERATOR_OPTIONS;
    // this.MY_BUNDLE_TYPE = CRITERIA_COMPONENT_DICT.BUNDLE;
    this.BUNDLE_TYPE_LABEL = '條件';
    this.state = {
      isLoaded: true,
      properties: Map(this.getBundleProperties(props.criteria))
    };
  };

  componentWillReceiveProps(nextProps) {
    // console.log('componentWillReceiveProps: ', nextProps);
    if (this.props.isPreview !== nextProps.isPreview) {
      this.setState(prevState => ({
        properties: prevState.properties.merge(this.getBundleProperties(nextProps.criteria))
      }));
    }
  };

  getBundleProperties({id, type, operator, ref, ref_label, criteria} = {}) {
    return {
      id: id || shortid.generate(),
      type: type || this.myBundleType(), //combo, ref, field
      operator: operator || 'and',   //and, or, eq, ne, lt, le, gt, ge, not
      ref: ref || null,
      ref_label: ref_label || null,
      criteria: List(criteria)
    };
  };

  myBundleType() {
    return CRITERIA_COMPONENT_DICT.BUNDLE;
  };

  componentWillMount() {
    // console.log('CriteriaBundle: componentWillMount: ', this.state);
    this.criteriaComponents = {};

    this.collectCriteriaComponents = (id, component) => {
      // console.log('CriteriaBundle::componentWillMount::collectCriteriaComponents:: ', id);
      this.criteriaComponents[id] = component;
    };

    this.removeCriteriaComponents = (id) => {
      delete this.criteriaComponents[id];
    };

    this.gatheringChildCriteria = () => {
      return reduce(this.criteriaComponents, (collector, comp, id) => {
        let crite = comp.criteriaGathering(); //immutable Map

        if (!isEmpty(crite))
          collector.push(crite);
        return collector
      }, []);
    };

    this.criteriaGathering = () => {
      let subCrits = this.gatheringChildCriteria();

      return (subCrits.length === 0)? {}: assign({}, this.state.properties.toJSON(), {
        criteria: subCrits
      });
    };

    this.insertCriteriaState = (criteria) => {
      console.log('criteria: ', criteria);
      this.setState(prevState => ({
        properties: prevState.properties.set('criteria', prevState.properties.get('criteria').push(criteria))
      }));
    };

    this.removeCriteria = (index) => {
      this.setState(prevState => ({
        properties: prevState.properties.set('criteria', prevState.properties.get('criteria').delete(index))
      }));
    };

    this.getPropertyState = (key) => {
      return this.state.properties.get(key);
    };

    this.changeOperatorHandler = (value) => {
      this.setState(prevState => ({
        properties: prevState.properties.set('operator', value)
      }));
    };

  };

  componentDidMount() {
    this.props.collectCriteriaComponents(this.getPropertyState('id'), this);
  };

  componentWillUnmount() {
    // console.log('CriteriaBundle::componentWillUnmount: ', this.state);
    this.props.removeCriteriaComponents(this.getPropertyState('id'));
  };

  render() {
    let ComponentBundleBody = this.ComponentBundleBody.bind(this);
    let ComponentButtonInsertCriteria = this.ComponentButtonInsertCriteria.bind(this);
    // let ComponentCustomized = this.ComponentCustomized.bind(this);
    let ComponentBundleOperator = this.ComponentBundleOperator.bind(this);
    // let ComponentChildCriteriaBlock = this.ComponentChildCriteriaBlock.bind(this);
    let ComponentBundleBodyTail = this.ComponentBundleBodyTail.bind(this);
    let ComponentBundleBodyFront = this.ComponentBundleBodyFront.bind(this);
    return (
      <div>
        {/*<!-- head -->*/}
        <ComponentBundleBody criteria={this.state.properties.toJS()}
                             isPreview={this.props.isPreview}
                             OPERATOR_OPTIONS={this.OPERATOR_OPTIONS}
                             changeOperatorHandler={this.changeOperatorHandler}
                             ComponentBundleBodyFront={ComponentBundleBodyFront}
                             ComponentBundleOperator={ComponentBundleOperator}
                             ComponentBundleBodyTail={ComponentBundleBodyTail}/>
        {/*<!-- 第二層 -->*/}
        {this.ComponentChildCriteriaBlock()}
        {/*<ComponentChildCriteriaBlock {...this.props}/>*/}
        <ComponentButtonInsertCriteria isPreview={this.props.isPreview}
                                       addCriteriaClickHandler={this.addCriteriaClickHandler.bind(this)}/>
        {this.ComponentCustomized()}
      </div>
    );
  };

  addCriteriaClickHandler() {
    this.props.assignCriteria(this.insertCriteriaState);
  };

  ComponentCustomized(props) {
    return (<div/>);
  };

  ComponentBundleBody(props) {
    let ComponentBundleBodyFront = props.ComponentBundleBodyFront;
    let ComponentBundleOperator = props.ComponentBundleOperator;
    let ComponentBundleBodyTail = props.ComponentBundleBodyTail;
    return (
      <div className="head">
        <ComponentBundleBodyFront/>
        <ComponentBundleOperator criteria={props.criteria}
                                 isPreview={props.isPreview}
                                 OPERATOR_OPTIONS={props.OPERATOR_OPTIONS}
                                 changeOperatorHandler={props.changeOperatorHandler}/>符合
        <ComponentBundleBodyTail criteria={props.criteria}
                                 isPreview={props.isPreview}/>
      </div>
    );
  };

  ComponentBundleBodyFront(props) {
    return (
      <span>以下{this.BUNDLE_TYPE_LABEL}</span>
    );
  };

  ComponentBundleBodyTail(props) {
    return null;
  };

  ComponentBundleOperator(props) {
    return (
      <select className="form-control"
              defaultValue={props.criteria.operator}
              disabled={props.isPreview}
              onChange={(e) => {
                let value = e.target.value;
                props.changeOperatorHandler(value);
              }}>
        {
          map(props.OPERATOR_OPTIONS, (value, key) => {
            return <option value={key} key={key}>{value}</option>;
          })
        }
      </select>
    );
  };

  ComponentChildCriteriaBlock(props) {
    return (
      <div className="level form-inline">
        {this.state.properties.get('criteria').map((_criteria, index) => {
          return this.ComponentChildCriteria(_criteria, index);
        })}
      </div>
    );
  };

  ComponentChildCriteria(criteria, index) {
    // console.log('CriteriaBundle::ChildCriteria: ', criteria);
    switch(criteria.type) {
      case CRITERIA_COMPONENT_DICT.FIELD:
        return <CriteriaField key={criteria.id}
                              criteria={criteria}
                              index={index}
                              isPreview={this.props.isPreview}
                              removeCriteria={this.removeCriteria}
                              collectCriteriaComponents={this.collectCriteriaComponents}
                              removeCriteriaComponents={this.removeCriteriaComponents}/>;
      case CRITERIA_COMPONENT_DICT.FIELD_TAG:
      case CRITERIA_COMPONENT_DICT.FIELD_TRAIL_TAG:
        return <CriteriaTag key={criteria.id}
                              criteria={criteria}
                              index={index}
                              isPreview={this.props.isPreview}
                              removeCriteria={this.removeCriteria}
                              collectCriteriaComponents={this.collectCriteriaComponents}
                              removeCriteriaComponents={this.removeCriteriaComponents}/>;
      default:
        return <div key={criteria.id}/>;
    }
  };

  ComponentButtonInsertCriteria(props) {
    if (!props.isPreview) {
      return (
        <div className="add_condition">{/*<!-- 加條件 條件組合 -->*/}
          <button type="button" className="btn btn-warning" onClick={props.addCriteriaClickHandler}>
            <i className="fa fa-plus" aria-hidden="true"/>加條件
          </button>
        </div>
      );
    } else {
      return null;
    }
  };
};
