import React from 'react';
// import CriteriaComboBundle from './CriteriaComboBundle';
import {reduce, isEmpty, assign} from 'lodash';
import shortid from 'shortid';
// import {List} from "immutable";

const getDefaultBundleProps = () => {
  // console.log('DEFAULT_BUNDLE_PROPS: ', DEFAULT_BUNDLE_PROPS);
  return {
    id: shortid.generate()
  };
};

export default class CriteriaComboBundleList extends React.PureComponent {
  constructor(props) {
    super(props);
  }

  componentWillMount() {
    this.criteriaComponents = {};
    // console.log('CriteriaComboBundleList  componentWillMount: ', this.criteriaComponents);

    this.collectCriteriaComponents = (id, component) => {
      this.criteriaComponents[id] = component;
      // console.log('CriteriaComboBundleList::collectCriteriaComponents:: ', component);
    };

    this.removeCriteriaComponents = (id) => {
      // console.log('CriteriaComboBundleList::removeCriteriaComponents: ', id);
      delete this.criteriaComponents[id];
      // console.log('CriteriaComboBundleList::removeCriteriaComponents: ', component);
      // let index = indexOf(this.criteriaComponents, component);
      // console.log('CriteriaComboBundleList::removeCriteriaComponents::findIndex ', index);
      // this.criteriaComponents.splice(index, 1);
      // console.log('CriteriaComboBundleList::removeCriteriaComponents: ', this.criteriaComponents);
    };

    this.criteriaGathering = () => {
      // console.log('CriteriaComboBundleList::criteriaGathering: ', this.criteriaComponents);
      return reduce(this.criteriaComponents, (collector, comp) => {
        let crite = comp.criteriaGathering(); //immutable map
        // console.log('CriteriaComboBundleList::componentWillMount::criteriaGathering::crite ', crite);
        return isEmpty(crite)? collector: collector.concat(crite);
      }, []);
    };
  }
  // componentWillUnmount() {
  //   console.log('CriteriaComboBundleList::componentWillUnmount');
  // };

  render() {
    let ComponentCriteriaBundleContainer = this.props.ComponentCriteriaBundleContainer;
    let criteria =  isEmpty(this.props.criteria)? [getDefaultBundleProps()]: this.props.criteria;
    // console.log('CriteriaComboBundleList:render::_criteria: ', criteria);
    return (
      <div>
        {criteria.map(_criteria => {
          // console.log('this.props.criteria.map::_criteria: ', _criteria);
          return <ComponentCriteriaBundleContainer //{...this.props}
            key={_criteria.id}
            isPreview={this.props.isPreview}
            criteria={_criteria}
            assignCriteria={this.props.assignCriteria}
            collectCriteriaComponents={this.collectCriteriaComponents}
            removeCriteriaComponents={this.removeCriteriaComponents}/>
        })}
      </div>
    );
  };
}