import React from 'react';
import CriteriaBundle from './CriteriaBundle';
import CriteriaDetailBundle from './CriteriaDetailBundle';

export default class CriteriaComboBundle extends CriteriaBundle {
  constructor(props) {
    super(props, 'combo');
  }

  componentWillUnmount() {
    console.log('CriteriaComboBundle: componentWillUnmount', this.props.criteria.key);
  };

  BundleContent(criteria, mapToProps) {
    //console.log('CriteriaComboBundle criteria.type: ', criteria.type);
    switch(criteria.type) {
      case 'combo':
        return <CriteriaComboBundle key={criteria.key} criteria={criteria} {...mapToProps}/>;
      case 'bundle':
        return <CriteriaBundle key={criteria.key} criteria={criteria} {...mapToProps}/>;
      case 'refDetails':
        return <CriteriaDetailBundle key={criteria.key} criteria={criteria} {...mapToProps}/>;
      default:
        return super.BundleContent(criteria, mapToProps);
    }
  };

  ControlButton() {
    if (!this.props.isPreview) {
      return (
        <div className="add_condition">{/*<!-- 加條件 條件組合 -->*/}
          <button type="submit" className="btn btn-warning"><i className="fa fa-plus" aria-hidden="true"/>加條件</button>
          <button type="submit" className="btn btn-warning"><i className="fa fa-plus" aria-hidden="true"/>加條件組合</button>
        </div>
      );
    }
  };
};