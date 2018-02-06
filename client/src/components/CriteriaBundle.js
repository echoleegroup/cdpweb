import React from 'react';
import {List, Map} from 'immutable';
import {isEmpty, reduce, assign} from 'lodash';
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
    this.state = {
      isLoaded: true,
      properties: Map(this.getBundleProperties(props.criteria))
    };
  };

  myFieldType() {
    return CRITERIA_COMPONENT_DICT.BUNDLE;
  };

  getBundleProperties({uuid, type, operator, ref, ref_label, criteria} = {}) {
    // console.log('CriteriaBundle::getBundleProperties::injection.criteria(uuid=%s, type=%s, operator=%s, criteria=%s)', uuid, type, operator, criteria);
    return {
      uuid: uuid || shortid.generate(),
      type: type || this.myFieldType(), //combo, ref, field
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
      // console.log('CriteriaBundle::criteriaGathering: ', this.state.properties.get('type'), this.criteriaComponents);
      let subCrits = reduce(this.criteriaComponents, (collector, comp, uuid) => {
        let crite = comp.criteriaGathering(); //immutable Map
        // console.log('CriteriaBundle::criteriaGathering::crite ', crite);
        if (!isEmpty(crite))
          collector.push(crite);
        return collector
      }, []);

      // console.log('CriteriaBundle::criteriaGathering::subCrits ', subCrits);
      return (subCrits.length === 0)? {}: assign({}, this.state.properties.toJSON(), {
        criteria: subCrits
      });
    };

    this.toAssignCriteria = () => {
      this.props.assignCriteria(this.insertCriteriaState);
    };

    this.insertCriteriaState = (criteria) => {
      console.log('CriteriaBundle:insertCriteria: ', criteria);
      this.updatePropertyState('criteria', this.getPropertyState('criteria').push(criteria));
    };

    this.removeCriteria = (index) => {
      this.updatePropertyState('criteria', this.getPropertyState('criteria').delete(index));
    };

    this.getPropertyState = (key) => {
      return this.state.properties.get(key);
    };

    this.updatePropertyState = (key, value) => {
      this.setState(prevState => ({
        properties: prevState.properties.set(key, value)
      }));
    };

    this.props.collectCriteriaComponents(this.getPropertyState('uuid'), this);
  };

  componentWillUpdate(nextProps, nextState) {
    // console.log('CriteriaBundle: componentWillUpdate: ', nextState);
  };

  componentWillUnmount() {
    console.log('CriteriaBundle::componentWillUnmount: ', this.state);
    this.props.removeCriteriaComponents(this.getPropertyState('uuid'));
  };

  render() {
    return (
      <div>
        {/*<!-- head -->*/}
        {this.ComponentCriteriaBody()}
        {/*<!-- 第二層 -->*/}
        {this.ComponentChildCriteriaBlock()}
        {this.ComponentButtonInsertCriteria()}
        {this.ComponentCustomized()}
      </div>
    );
  }

  ComponentCustomized() {
    return (<div/>);
  };

  ComponentCriteriaBody() {
    // console.log('CriteriaBundle::ComponentCriteriaBody');
    return (
      <div className="head">
        以下條件{this.CriteriaOperatorSelector()}符合
        {this.ComponentCriteriaBodyTail()}
      </div>
    );
  };

  ComponentCriteriaBodyTail() {
    return null;
  };

  CriteriaOperatorSelector() {
    // console.log('CriteriaOperatorSelector::CriteriaBundle: ', typeof this.state);
    return (
      <select className="form-control"
              defaultValue={this.getPropertyState('operator')}
              disabled={this.props.isPreview}
              onChange={(e) => {
                let value = e.target.value;
                this.updatePropertyState('operator', value);
      }}>
        {
          Object.keys(this.OPERATOR_OPTIONS).map((key) => {
            return <option value={key} key={key}>{this.OPERATOR_OPTIONS[key]}</option>;
          })
        }
      </select>
    );
  };

  ComponentChildCriteriaBlock() {
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

  ComponentButtonInsertCriteria() {
    if (!this.props.isPreview) {
      return (
        <div className="add_condition">{/*<!-- 加條件 條件組合 -->*/}
          <button type="button" className="btn btn-warning" onClick={this.toAssignCriteria}>
            <i className="fa fa-plus" aria-hidden="true"/>加條件
          </button>
        </div>
      );
    }
  };
};
