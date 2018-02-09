import React from 'react';
// import CriteriaComboBundle from './CriteriaComboBundle';
import {reduce, isEmpty, assign} from 'lodash';
import shortid from 'shortid';
// import {List} from "immutable";

const DEFAULT_BUNDLE_PROPS = {
  uuid: shortid.generate()
  //type: 'combo',  //combo, ref, field
  //operator: 'and',  //and, or, eq, ne, lt, le, gt, ge, not
  //ref: null,
  //ref_label: null,
  //criteria: List()
};

export default class CriteriaComboBundleList extends React.PureComponent {
  constructor(props) {
    super(props);
  }

  componentWillMount() {
    this.criteriaComponents = {};
    this.id = shortid.generate();
    console.log('CriteriaComboBundleList  componentWillMount: ', this.id);

    this.collectCriteriaComponents = (uuid, component) => {
      this.criteriaComponents[uuid] = component;
      console.log('CriteriaComboBundleList::collectCriteriaComponents:: ', this.id);
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

    this.criteriaGathering = () => {
      console.log('CriteriaComboBundleList::criteriaGathering: ', this.criteriaComponents);
      return reduce(this.criteriaComponents, (collector, comp) => {
        let crite = comp.criteriaGathering(); //immutable map
        console.log('CriteriaComboBundleList::componentWillMount::criteriaGathering::crite ', crite);
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

    this.getDefaultBundleProps = () => {
      // console.log('DEFAULT_BUNDLE_PROPS: ', DEFAULT_BUNDLE_PROPS);
      return assign({}, DEFAULT_BUNDLE_PROPS);
    };
  }

  // componentWillUnmount() {
  //   console.log('CriteriaComboBundleList::componentWillUnmount');
  // };

  render() {
    let criteria = isEmpty(this.props.criteria)? [this.getDefaultBundleProps()]: this.props.criteria;
    let ComponentCriteriaBundleContainer = this.props.ComponentCriteriaBundleContainer;
    // console.log('CriteriaComboBundleList:render::_criteria: ', criteria);
    return (
      <div>
        {criteria.map((_criteria, index) => {
          // console.log('this.props.criteria.map::_criteria: ', _criteria);
          return <ComponentCriteriaBundleContainer {...this.props}
                                                   key={_criteria.uuid}
                                                   criteria={_criteria}
                                                   collectCriteriaComponents={this.collectCriteriaComponents}
                                                   removeCriteriaComponents={this.removeCriteriaComponents}/>
        })}
      </div>
    );
  };
}