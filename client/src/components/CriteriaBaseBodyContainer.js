import React from 'react';

export default class CriteriaBaseBodyContainer extends React.PureComponent {
  render() {
    let props = this.props;
    let ComponentCriteriaBody = props.ComponentCriteriaBody;
    return (
      <div className={props.styleClass}>
        <ComponentCriteriaBody criteria={this.props.criteria}
                               ComponentCriteriaBundleContainer={this.props.ComponentCriteriaBundleContainer}/>
      </div>
    );
  };
};