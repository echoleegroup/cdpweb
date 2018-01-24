import React from 'react';
import {assign} from 'lodash';
import CriteriaBundle from './CriteriaBundle';
import CriteriaDetailBundle from './CriteriaDetailBundle';
import {CRITERIA_COMPONENT_DICT} from '../utils/criteria-dictionary';

export default class CriteriaComboBundle extends CriteriaBundle {
  constructor(props) {
    super(props);
  }

  getBundleProperties(criteria) {
    // console.log('getBundleProperties:criteria: ', criteria);
    return super.getBundleProperties(assign({}, criteria, {type: CRITERIA_COMPONENT_DICT.COMBO}))
  };

  getAssignCriteriaBundleType() {
    return CRITERIA_COMPONENT_DICT.BUNDLE
  };

  componentWillMount() {
    // console.log('CriteriaComboBundle::componentWillMount: ', this.state);
    super.componentWillMount();

    this.assignCriteriaBundle = () => {
      this.setState({
        criteria: this.state.criteria.push(super.getBundleProperties({
          type: this.getAssignCriteriaBundleType()
        }))
      });
    };
  };

  componentWillUpdate(nextProps, nextState) {
    // console.log('CriteriaBundle: componentWillUpdate: ', nextState);
  };

  componentWillUnmount() {
    console.log('CriteriaComboBundle: componentWillUnmount', this.state);
    super.componentWillUnmount();
  };

  ChildCriteria(criteria, index) {
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
        return super.ChildCriteria(criteria, index);
    }
  };

  ControlButton() {
    if (!this.props.isPreview) {
      return (
        <div className="add_condition">{/*<!-- 加條件 條件組合 -->*/}
          <button type="button" className="btn btn-warning" onClick={this.assignCriteria}>
            <i className="fa fa-plus" aria-hidden="true"/>加條件
          </button>
          <button type="button" className="btn btn-warning" onClick={this.assignCriteriaBundle}>
            <i className="fa fa-plus" aria-hidden="true"/>加條件組合
          </button>
        </div>
      );
    }
  };
};