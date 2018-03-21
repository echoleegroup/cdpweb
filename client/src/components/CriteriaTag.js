import React from 'react';

export default class CriteriaTag extends React.PureComponent {
  componentWillMount() {
    this.criteriaGathering = () => {
      console.log('CriteriaTag::criteriaGathering: ', this.props.criteria);
      return this.props.criteria;
    };
  };

  componentDidMount() {
    this.props.collectCriteriaComponents(this.props.criteria.id, this);
  };

  componentWillUnmount() {
    this.props.removeCriteriaComponents(this.props.criteria.id);
  };

  render() {
    return (
      <li className="tag_item">
        {this.props.criteria.value_label}
        {(this.props.isPreview)? null: <a href="javascript:;"><i className="fa fa-times" aria-hidden="true" onClick={() => {
          // console.log('CriteriaField::onClick::removeCriteria: ', criteria.id);
          this.props.removeCriteria(this.props.index);
        }}/></a>}
      </li>
    );
  };
};