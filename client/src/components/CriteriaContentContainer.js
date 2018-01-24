import React from 'react';

export default class CriteriaContentContainer extends React.PureComponent {
  render() {
    let props = this.props;
    return (
      <div className="table_block">
        {props.ComponentHeadline}
        {props.ComponentSideHead}
        <div className={props.styleClass}>
          {props.ComponentCriteriaBody}
        </div>
        {props.ComponentControlButton}
      </div>
    );
  };
};