import React from 'react';
import {reduce, isEmpty} from 'lodash';
import shortid from 'shortid';

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

    this.collectCriteriaComponents = (id, component) => {
      this.criteriaComponents[id] = component;
    };

    this.removeCriteriaComponents = (id) => {
      delete this.criteriaComponents[id];
    };

    this.criteriaGathering = () => {
      return reduce(this.criteriaComponents, (collector, comp) => {
        let crite = comp.criteriaGathering(); //immutable map
        return isEmpty(crite)? collector: collector.concat(crite);
      }, []);
    };
  }

  render() {
    let ComponentCriteriaBundleContainer = this.props.ComponentCriteriaBundleContainer;
    let criteria =  isEmpty(this.props.criteria)? [getDefaultBundleProps()]: this.props.criteria;
    return (
      <div>
        {criteria.map(_criteria => {
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