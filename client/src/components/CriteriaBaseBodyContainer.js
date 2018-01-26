import React from 'react';

export default class CriteriaBaseBodyContainer extends React.PureComponent {
  render() {
    let props = this.props;
    return (
      <div className={props.styleClass}>
        {props.ComponentCriteriaBody}
      </div>
    );
  };
};