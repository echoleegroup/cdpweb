import React from 'react';
import {List, Map} from 'immutable';
import {isEmpty, reduce, assign, map} from 'lodash';
import shortid from 'shortid';
import CriteriaField from './CriteriaField';
import {CRITERIA_COMPONENT_DICT} from '../utils/criteria-dictionary';

const OPERATOR_OPTIONS = {
  and: '全部',
  or: '任一'
};

export default class CriteriaBundle extends React.PureComponent {
  constructor(props) {
    super(props);
    this.OPERATOR_OPTIONS = OPERATOR_OPTIONS;
    this.MY_BUNDLE_TYPE = CRITERIA_COMPONENT_DICT.BUNDLE;
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

  getBundleProperties({uuid, type, operator, ref, ref_label, criteria} = {}) {
    return {
      uuid: uuid || shortid.generate(),
      type: type || this.MY_BUNDLE_TYPE, //combo, ref, field
      operator: operator || 'and',   //and, or, eq, ne, lt, le, gt, ge, not
      ref: ref || null,
      ref_label: ref_label || null,
      criteria: List(criteria)
    };
  };

  componentWillMount() {
    // console.log('CriteriaBundle: componentWillMount: ', this.state);
    this.criteriaComponents = {};

    this.collectCriteriaComponents = (uuid, component) => {
      // console.log('CriteriaBundle::componentWillMount::collectCriteriaComponents:: ', uuid);
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

    this.gatheringChildCriteria = () => {
      return reduce(this.criteriaComponents, (collector, comp, uuid) => {
        let crite = comp.criteriaGathering(); //immutable Map
        // console.log('CriteriaBundle::criteriaGathering::crite ', crite);
        if (!isEmpty(crite))
          collector.push(crite);
        return collector
      }, []);
    };

    this.criteriaGathering = () => {
      // console.log('CriteriaBundle::criteriaGathering: ', this.criteriaComponents);
      let subCrits = this.gatheringChildCriteria();

      // console.log('CriteriaBundle::criteriaGathering::subCrits ', subCrits);
      // console.log('CriteriaBundle::criteriaGathering::subCrits.length ', subCrits.length);
      return (subCrits.length === 0)? {}: assign({}, this.state.properties.toJSON(), {
        criteria: subCrits
      });
    };

    this.insertCriteriaState = (criteria) => {
      // console.log('CriteriaBundle:insertCriteria: ', criteria);
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
      // this.updatePropertyState('criteria', childCriteria);
      // this.updatePropertyState('operator', value);
    };

    // this.updatePropertyState = (key, value) => {
    //   this.setState(prevState => ({
    //     properties: prevState.properties.set(key, value)
    //   }));
    // };
  };

  componentDidMount() {
    this.props.collectCriteriaComponents(this.getPropertyState('uuid'), this);
  };

  // componentWillUpdate(nextProps, nextState) {
  //   console.log('CriteriaBundle: componentWillUpdate: ', nextState);
  // };

  componentWillUnmount() {
    // console.log('CriteriaBundle::componentWillUnmount: ', this.state);
    this.props.removeCriteriaComponents(this.getPropertyState('uuid'));
  };

  render() {
    let ComponentBundleBody = this.ComponentBundleBody.bind(this);
    let ComponentButtonInsertCriteria = this.ComponentButtonInsertCriteria.bind(this);
    let ComponentCustomized = this.ComponentCustomized.bind(this);
    let ComponentBundleOperator = this.ComponentBundleOperator.bind(this);
    let ComponentBundleBodyTail = this.ComponentBundleBodyTail.bind(this);
    return (
      <div>
        {/*<!-- head -->*/}
        <ComponentBundleBody criteria={this.state.properties.toJS()}
                             isPreview={this.props.isPreview}
                             OPERATOR_OPTIONS={this.OPERATOR_OPTIONS}
                             changeOperatorHandler={this.changeOperatorHandler}
                             ComponentBundleOperator={ComponentBundleOperator}
                             ComponentBundleBodyTail={ComponentBundleBodyTail}/>
        {/*<!-- 第二層 -->*/}
        <div className="level form-inline">
          {this.state.properties.get('criteria').map((_criteria, index) => {
            return this.ComponentChildCriteria(_criteria, index);
            // console.log('_criteria.uuid: ', _criteria.uuid);
            // return <ComponentChildCriteria key={_criteria.uuid}
            //                         isPreview={this.props.isPreview}
            //                         criteria={_criteria}
            //                         index={index}/>
          })}
        </div>
        <ComponentButtonInsertCriteria isPreview={this.props.isPreview}
                                       addCriteriaClickHandler={this.addCriteriaClickHandler.bind(this)}/>
        <ComponentCustomized/>
      </div>
    );
  };

  addCriteriaClickHandler() {
    this.props.assignCriteria(this.insertCriteriaState);
  };

  addCriteriaClickHandler() {
    this.props.assignCriteria(this.insertCriteriaState);
  };

  ComponentCustomized(props) {
    return (<div/>);
  };

  ComponentBundleBody(props) {
    let ComponentBundleOperator = props.ComponentBundleOperator;
    let ComponentBundleBodyTail = props.ComponentBundleBodyTail;
    return (
      <div className="head">
        以下{this.BUNDLE_TYPE_LABEL}
        <ComponentBundleOperator criteria={props.criteria}
                                 isPreview={props.isPreview}
                                 OPERATOR_OPTIONS={props.OPERATOR_OPTIONS}
                                 changeOperatorHandler={props.changeOperatorHandler}/>符合
        <ComponentBundleBodyTail criteria={props.criteria}
                                 isPreview={props.isPreview}/>
      </div>
    );
  };

  ComponentBundleBodyTail(props) {
    return null;
  };

  ComponentBundleOperator(props) {
    // console.log('ComponentBundleOperator::CriteriaBundle: ', typeof this.state);
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

  // ComponentChildCriteriaBlock() {
  //   return (
  //     <div className="level form-inline">
  //       {this.state.properties.get('criteria').map((_criteria, index) => {
  //         return this.ComponentChildCriteria(_criteria, index);
  //       })}
  //     </div>
  //   );
  // };

  ComponentChildCriteria(criteria, index) {
    // console.log('CriteriaBundle::ChildCriteria: ', criteria);
    switch(criteria.type) {
      case CRITERIA_COMPONENT_DICT.FIELD:
        return <CriteriaField key={criteria.uuid}
                              criteria={criteria}
                              index={index}
                              isPreview={this.props.isPreview}
                              removeCriteria={this.removeCriteria}
                              collectCriteriaComponents={this.collectCriteriaComponents}
                              removeCriteriaComponents={this.removeCriteriaComponents}/>;
      default:
        return <div key={criteria.uuid}/>;
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
