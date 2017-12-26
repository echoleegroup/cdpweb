import React from 'react';
import CriteriaComboBundle from './CriteriaComboBundle';

export default class CriteriaComboBundleList extends React.PureComponent {
  componentWillUnmount() {
    console.log('CriteriaComboBundleList: componentWillUnmount');
  };

  render() {
    console.log('_criteria: ', this.props.criteria);
    let mapToProps = {
      isPreview: this.props.isPreview,
      foldingFields: this.props.foldingFields,
      refOptions: this.props.refOptions,
      refFields: this.props.refFields,
      refFolds: this.props.refFolds
    };
    return (
      <div>
        {this.props.criteria.map((_criteria) => {
          return <CriteriaComboBundle key={_criteria.key} criteria={_criteria} {...mapToProps}/>
        })}
      </div>
    );
  };

  getCriteria() {
    //
  };
}