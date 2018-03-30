import React from 'react';
import CriteriaBundle from './CriteriaBundle';
import CriteriaBundleTransaction from './CriteriaBundleTransaction';
import {CRITERIA_COMPONENT_DICT} from '../utils/criteria-dictionary';
import CriteriaBundleTag from "./CriteriaBundleTag";
import CriteriaBundleTrailPeriod from "./CriteriaBundleTrailPeriod";
import CriteriaBundleTrailHit from "./CriteriaBundleTrailHit";

export default class CriteriaComboBundle extends CriteriaBundle {
  constructor(props) {
    super(props);
  }

  myBundleType() {
    return CRITERIA_COMPONENT_DICT.COMBO;
  };

  childBundleType() {
    return CRITERIA_COMPONENT_DICT.BUNDLE;
  };

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
        return <CriteriaBundleTransaction key={criteria.id}
                                          criteria={criteria}
                                          index={index}
                                          isPreview={this.props.isPreview}
                                          removeCriteria={this.removeCriteria}
                                          collectCriteriaComponents={this.collectCriteriaComponents}
                                          removeCriteriaComponents={this.removeCriteriaComponents}/>;
      case CRITERIA_COMPONENT_DICT.TAG:
        return <CriteriaBundleTag key={criteria.id}
                                  criteria={criteria}
                                  index={index}
                                  isPreview={this.props.isPreview}
                                  removeCriteria={this.removeCriteria}
                                  collectCriteriaComponents={this.collectCriteriaComponents}
                                  removeCriteriaComponents={this.removeCriteriaComponents}/>;
      case CRITERIA_COMPONENT_DICT.TRAIL_PERIOD:
        return <CriteriaBundleTrailPeriod key={criteria.id}
                                  criteria={criteria}
                                  index={index}
                                  isPreview={this.props.isPreview}
                                  removeCriteria={this.removeCriteria}
                                  collectCriteriaComponents={this.collectCriteriaComponents}
                                  removeCriteriaComponents={this.removeCriteriaComponents}/>;
      case CRITERIA_COMPONENT_DICT.TRAIL_HIT:
        return <CriteriaBundleTrailHit key={criteria.id}
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