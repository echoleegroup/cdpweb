import React from 'react';
import CriteriaComboBundle from './CriteriaComboBundle';
import {isEmpty} from 'lodash';

export default class CriteriaComboBundleList extends React.PureComponent {
  constructor(props) {
    super(props);
  }

  componentWillMount() {
    let _this = this;
    _this.getCriteria = () => {
      console.log('CriteriaComboBundleList::componentWillMount::getCriteria: ', _this.criteriaComponents);
      return _this.criteriaComponents.reduce((collector, comp) => {
        let crite = comp.getCriteria();
        return isEmpty(crite)? collector: collector.concat(crite);
      }, []);
    };
  }

  componentWillUnmount() {
    console.log('CriteriaComboBundleList: componentWillUnmount');
  };

  render() {
    //console.log('CriteriaComboBundleList:render::_criteria: ', this.props.criteria);
    this.criteriaComponents = [];
    if(this.props.criteria.length === 0) {
      return (
        <CriteriaComboBundle {...this.props} ref={(e) =>{
          console.log('CriteriaComboBundleList:CriteriaComboBundle::ref: ', e);
          e && this.criteriaComponents.push(e);
        }}/>
      );
    }
    return (
      <div>
        {this.props.criteria.map((_criteria) => {
          return <CriteriaComboBundle key={_criteria.uuid} {...this.props} criteria={_criteria} ref={(e) =>{
            console.log('CriteriaComboBundleList:CriteriaComboBundle::ref: ', e);
            e && this.criteriaComponents.push(e);
          }}/>
        })}
      </div>
    );
  };
}