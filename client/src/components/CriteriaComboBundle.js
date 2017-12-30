import React from 'react';
import CriteriaBundle from './CriteriaBundle';
import CriteriaDetailBundle from './CriteriaDetailBundle';

export default class CriteriaComboBundle extends CriteriaBundle {
  constructor(props) {
    super(props, {
      type: 'combo'
    });
  }

  componentWillMount() {
    console.log('CriteriaComboBundle::componentWillMount: ', this.state);
    super.componentWillMount();
  };

  componentWillUpdate(nextProps, nextState) {
    console.log('CriteriaBundle: componentWillUpdate: ', nextState);
  };

  componentWillUnmount() {
    console.log('CriteriaComboBundle: componentWillUnmount', this.state);
    super.componentWillUnmount();
  };

  ChildCriteria(criteria, index) {
    switch(criteria.type) {
      case 'combo':
        return <CriteriaComboBundle key={criteria.uuid} {...this.props}
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
      case 'bundle':
        return <CriteriaBundle key={criteria.uuid} {...this.props}
                               criteria={criteria}
                               index={index}
                               removeCriteria={this.removeCriteria}
                               collectCriteriaComponents={this.collectCriteriaComponents}
                               removeCriteriaComponents={this.removeCriteriaComponents}
                               /*
                               ref={(e) => {
                                 if(e) this.collectCriteriaComponents(criteria.uuid, e);
                                 else this.removeCriteria(criteria.uuid);
                               }}*//>;
      case 'refDetails':
        return <CriteriaDetailBundle key={criteria.uuid} {...this.props}
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
        return super.ChildCriteria(criteria, index);
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
            this.setState({
              criteria: this.state.criteria.push(this.getInitialState())
            });
          }}><i className="fa fa-plus" aria-hidden="true"/>加條件組合</button>
        </div>
      );
    }
  };
};