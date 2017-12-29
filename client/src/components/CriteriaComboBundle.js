import React from 'react';
import CriteriaBundle from './CriteriaBundle';
import CriteriaDetailBundle from './CriteriaDetailBundle';

export default class CriteriaComboBundle extends CriteriaBundle {
  constructor(props) {
    super(props, {
      type: 'combo'
    });
  }

  componentWillUnmount(nextProps, nextState) {
    console.log('CriteriaComboBundle: componentWillUnmount', nextState);
  };

  ChildCriteria(criteria) {
    switch(criteria.type) {
      case 'combo':
        return <CriteriaComboBundle key={criteria.uuid} {...this.props}
                                    criteria={criteria}
                                    ref={(e) => {
                                      e && this.criteriaComponents.push(e);
                                    }}/>;
      case 'bundle':
        return <CriteriaBundle key={criteria.uuid} {...this.props}
                               criteria={criteria}
                               ref={(e) => {
                                 e && this.criteriaComponents.push(e);
                               }}/>;
      case 'refDetails':
        return <CriteriaDetailBundle key={criteria.uuid} {...this.props}
                                     criteria={criteria}
                                     ref={(e) => {
                                       e && this.criteriaComponents.push(e);
                                     }}/>;
      default:
        return super.ChildCriteria(criteria);
    }
  };

  ControlButton() {
    if (!this.props.isPreview) {
      return (
        <div className="add_condition">{/*<!-- 加條件 條件組合 -->*/}
          <button type="button" className="btn btn-warning" onClick={() => {
            this.props.addCriteriaField(this.setCriteria);
          }}><i className="fa fa-plus" aria-hidden="true"/>加條件</button>
          <button type="button" className="btn btn-warning" onClick={() => {
            this.setState((prevState) => {
              return Object.assign({}, prevState, {
                criteria: prevState.criteria.concat(this.getInitialState())
              })
            })
          }}><i className="fa fa-plus" aria-hidden="true"/>加條件組合</button>
        </div>
      );
    }
  };
};