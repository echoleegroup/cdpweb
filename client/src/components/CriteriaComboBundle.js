import React from 'react';
import {assign} from 'lodash';
import CriteriaBundle from './CriteriaBundle';
import CriteriaDetailBundle from './CriteriaTransactionBundle';
import {CRITERIA_COMPONENT_DICT} from '../utils/criteria-dictionary';

export default class CriteriaComboBundle extends CriteriaBundle {
  constructor(props) {
    super(props);
  }

  // getBundleProperties(criteria) {
  //   console.log('getBundleProperties:criteria: ', criteria);
  //   return super.getBundleProperties(assign({}, {type: CRITERIA_COMPONENT_DICT.COMBO}, criteria));
  // };

  getInsertCriteriaBundleType() {
    // console.log('getInsertCriteriaBundleType: ', CRITERIA_COMPONENT_DICT.BUNDLE);
    return CRITERIA_COMPONENT_DICT.BUNDLE
  };

  componentWillMount() {
    // console.log('CriteriaComboBundle::componentWillMount: ', this.state);
    super.componentWillMount();
  };

  componentWillUpdate(nextProps, nextState) {
    console.log('CriteriaBundle: componentWillUpdate: ', nextState.criteria.toJS());
  };

  componentWillUnmount() {
    // console.log('CriteriaComboBundle: componentWillUnmount', this.state);
    super.componentWillUnmount();
  };

  ComponentChildCriteria(criteria, index) {
    console.log('ComponentChildCriteria: ', criteria);
    switch(criteria.type) {
      case CRITERIA_COMPONENT_DICT.COMBO:
        return <CriteriaComboBundle key={criteria.uuid} {...this.props}
                                    criteria={criteria}
                                    index={index}
                                    removeCriteria={this.removeCriteria}
                                    collectCriteriaComponents={this.collectCriteriaComponents}
                                    removeCriteriaComponents={this.removeCriteriaComponents}/>;
      case CRITERIA_COMPONENT_DICT.BUNDLE:
        return <CriteriaBundle key={criteria.uuid} {...this.props}
                               criteria={criteria}
                               index={index}
                               removeCriteria={this.removeCriteria}
                               collectCriteriaComponents={this.collectCriteriaComponents}
                               removeCriteriaComponents={this.removeCriteriaComponents}/>;
      case CRITERIA_COMPONENT_DICT.TRANSACTION:
        return <CriteriaDetailBundle key={criteria.uuid} {...this.props}
                                     criteria={criteria}
                                     index={index}
                                     removeCriteria={this.removeCriteria}
                                     collectCriteriaComponents={this.collectCriteriaComponents}
                                     removeCriteriaComponents={this.removeCriteriaComponents}/>;
      default:
        return super.ComponentChildCriteria(criteria, index);
    }
  };

  toInsertCriteriaBundle() {
    // console.log('toInsertCriteriaBundle: ', this.state.criteria.toJS());
    this.setState({
      criteria: this.state.criteria.push(this.getBundleProperties({
        type: this.getInsertCriteriaBundleType()
      }))
    });
  };

  ComponentButtonInsertCriteria() {
    if (!this.props.isPreview) {
      return (
        <div className="add_condition">{/*<!-- 加條件 條件組合 -->*/}
          <button type="button" className="btn btn-warning" onClick={this.toAssignCriteria}>
            <i className="fa fa-plus" aria-hidden="true"/>加條件
          </button>
          <button type="button" className="btn btn-warning" onClick={this.toInsertCriteriaBundle.bind(this)}>
            <i className="fa fa-plus" aria-hidden="true"/>加條件組合
          </button>
        </div>
      );
    }
  };
};