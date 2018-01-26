import React from 'react';
import CriteriaBaseBodyContainer from './CriteriaBaseBodyContainer';

export default class CriteriaBaseContainer extends React.PureComponent {
  render() {
    let props = this.props;
    return (
      <div className="table_block">
        {props.ComponentHeadline}
        {props.ComponentSideHead}
        <CriteriaBaseBodyContainer styleClass={props.styleClass}
                                   ComponentCriteriaBody={props.ComponentCriteriaBody}/>
        {props.ComponentControlButton}
      </div>
    );
  };
};