import React from 'react';
import CriteriaComboBundle from './CriteriaComboBundle';
import {reduce, isEmpty} from 'lodash';
import shortid from 'shortid';

export default class CriteriaComboBundleList extends React.PureComponent {
  constructor(props) {
    super(props);
  }

  componentWillMount() {
    this.criteriaComponents = {};

    this.collectCriteriaComponents = (uuid, component) => {
      // console.log('CriteriaComboBundleList::componentWillMount::collectCriteriaComponents:: ', component);
      this.criteriaComponents[uuid] = component;
    };

    this.removeCriteriaComponents = (uuid) => {
      // console.log('CriteriaComboBundleList::removeCriteriaComponents: ', uuid);
      delete this.criteriaComponents[uuid];
      // console.log('CriteriaComboBundleList::removeCriteriaComponents: ', component);
      // let index = indexOf(this.criteriaComponents, component);
      // console.log('CriteriaComboBundleList::removeCriteriaComponents::findIndex ', index);
      // this.criteriaComponents.splice(index, 1);
      // console.log('CriteriaComboBundleList::removeCriteriaComponents: ', this.criteriaComponents);
    };

    this.getCriteria = () => {
      // console.log('CriteriaComboBundleList::componentWillMount::getCriteria: ', this.criteriaComponents);
      return reduce(this.criteriaComponents, (collector, comp) => {
        let crite = comp.getCriteria(); //immutable map
        // console.log('CriteriaComboBundleList::componentWillMount::getCriteria::crite ', crite);
        return isEmpty(crite)? collector: collector.concat(crite);
      }, []);
    };

    this.removeCriteria = (index) => {
      this.setState((prevState) => {
        // console.log('CriteriaComboBundleList:removeCriteria: ', prevState);
        // console.log('CriteriaComboBundleList:removeCriteria: ', prevState.get('criteria'));
        return {
          criteria: prevState.criteria.delete(index)
        };
      });
    };
  }

  componentWillUnmount() {
    console.log('CriteriaComboBundleList: componentWillUnmount');
  };

  render() {
    // console.log('CriteriaComboBundleList:render::_criteria: ', this.props.criteria);
    let criteria = isEmpty(this.props.criteria)? [{
      uuid: shortid.generate()
    }]: this.props.criteria;
    return (
      <div>
        {criteria.map((_criteria, index) => {
          // console.log('this.props.criteria.map::_criteria: ', _criteria);
          return <CriteriaComboBundle {...this.props}
                                      key={_criteria.uuid}
                                      criteria={_criteria}
                                      index={index}
                                      removeCriteria={this.removeCriteria}
                                      collectCriteriaComponents={this.collectCriteriaComponents}
                                      removeCriteriaComponents={this.removeCriteriaComponents}
                                      /*
                                      ref={(e) => {
                                        if(e) this.collectCriteriaComponents(_criteria.uuid, e);
                                        else this.removeCriteriaComponents(_criteria.uuid);
                                      }}*//>
        })}
      </div>
    );
  };
}