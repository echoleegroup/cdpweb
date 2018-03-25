import React from 'react';
import CriteriaBundle from './CriteriaBundle';
import CriteriaTransactionBundle from './CriteriaTransactionBundle';
import {CRITERIA_COMPONENT_DICT} from '../utils/criteria-dictionary';
import CriteriaTagBundle from "./CriteriaTagBundle";
import CriteriaTrailPeriodBundle from "./CriteriaTrailPeriodBundle";
import CriteriaTrailHitBundle from "./CriteriaTrailHitBundle";

export default class CriteriaComboBundle extends CriteriaBundle {
  constructor(props) {
    super(props);
    // this.MY_BUNDLE_TYPE = CRITERIA_COMPONENT_DICT.COMBO;
    // this.CHILD_BUNDLE_TYPE = CRITERIA_COMPONENT_DICT.BUNDLE;
  }

  myBundleType() {
    return CRITERIA_COMPONENT_DICT.COMBO;
  };

  childBundleType() {
    return CRITERIA_COMPONENT_DICT.BUNDLE;
  };

  // getBundleProperties(criteria) {
  //   console.log('getBundleProperties:criteria: ', criteria);
  //   return super.getBundleProperties(assign({}, {type: CRITERIA_COMPONENT_DICT.COMBO}, criteria));
  // };

  // getChildCriteriaBundleType() {
  //   // console.log('getChildCriteriaBundleType: ', CRITERIA_COMPONENT_DICT.BUNDLE);
  //   return CRITERIA_COMPONENT_DICT.BUNDLE
  // };

  // componentWillMount() {
  //   console.log('CriteriaComboBundle::componentWillMount: ', this.state);
  //   super.componentWillMount();
  // };

  // componentWillUpdate(nextProps, nextState) {
  //   console.log('CriteriaBundle: componentWillUpdate: ', nextState.properties.get('criteria').toJS());
  // };

  // componentWillUnmount() {
  //   console.log('CriteriaComboBundle: componentWillUnmount', this.state);
  //   super.componentWillUnmount();
  // };

  ComponentChildCriteria(criteria, index) {
    // console.log('ComponentChildCriteria: ', criteria);
    switch(criteria.type) {
      case CRITERIA_COMPONENT_DICT.COMBO:
        return <CriteriaComboBundle key={criteria.id}
                                    criteria={criteria}
                                    index={index}
                                    isPreview={this.props.isPreview}
                                    removeCriteria={this.removeCriteria}
                                    collectCriteriaComponents={this.collectCriteriaComponents}
                                    removeCriteriaComponents={this.removeCriteriaComponents}/>;
      case CRITERIA_COMPONENT_DICT.BUNDLE:
        return <CriteriaBundle key={criteria.id}
                               criteria={criteria}
                               index={index}
                               isPreview={this.props.isPreview}
                               assignCriteria={this.props.assignCriteria}
                               removeCriteria={this.removeCriteria}
                               collectCriteriaComponents={this.collectCriteriaComponents}
                               removeCriteriaComponents={this.removeCriteriaComponents}/>;
      case CRITERIA_COMPONENT_DICT.TRANSACTION:
        return <CriteriaTransactionBundle key={criteria.id}
                                          criteria={criteria}
                                          index={index}
                                          isPreview={this.props.isPreview}
                                          removeCriteria={this.removeCriteria}
                                          collectCriteriaComponents={this.collectCriteriaComponents}
                                          removeCriteriaComponents={this.removeCriteriaComponents}/>;
      case CRITERIA_COMPONENT_DICT.TAG:
        return <CriteriaTagBundle key={criteria.id}
                                  criteria={criteria}
                                  index={index}
                                  isPreview={this.props.isPreview}
                                  removeCriteria={this.removeCriteria}
                                  collectCriteriaComponents={this.collectCriteriaComponents}
                                  removeCriteriaComponents={this.removeCriteriaComponents}/>;
      case CRITERIA_COMPONENT_DICT.TRAIL_PERIOD:
        return <CriteriaTrailPeriodBundle key={criteria.id}
                                  criteria={criteria}
                                  index={index}
                                  isPreview={this.props.isPreview}
                                  removeCriteria={this.removeCriteria}
                                  collectCriteriaComponents={this.collectCriteriaComponents}
                                  removeCriteriaComponents={this.removeCriteriaComponents}/>;
      case CRITERIA_COMPONENT_DICT.TRAIL_HIT:
        return <CriteriaTrailHitBundle key={criteria.id}
                                       criteria={criteria}
                                       index={index}
                                       isPreview={this.props.isPreview}
                                       removeCriteria={this.removeCriteria}
                                       collectCriteriaComponents={this.collectCriteriaComponents}
                                       removeCriteriaComponents={this.removeCriteriaComponents}/>;
      default:
        return super.ComponentChildCriteria(criteria, index);
    }
  };

  toInsertCriteriaBundle() {
    let criteriaModel = this.getBundleProperties({
      type: this.childBundleType()
    });

    this.setState(prevState => ({
      properties: prevState.properties.set('criteria', prevState.properties.get('criteria').push(criteriaModel))
    }));
  };

  ComponentButtonInsertCriteria(props) {
    if (!props.isPreview) {
      return (
        <div className="add_condition">{/*<!-- 加條件 條件組合 -->*/}
          <button type="button" className="btn btn-warning" onClick={props.addCriteriaClickHandler}>
            <i className="fa fa-plus" aria-hidden="true"/>加條件
          </button>
          <button type="button" className="btn btn-warning" onClick={this.toInsertCriteriaBundle.bind(this)}>
            <i className="fa fa-plus" aria-hidden="true"/>加條件組合
          </button>
        </div>
      );
    } else {
      return null;
    }
  };
};