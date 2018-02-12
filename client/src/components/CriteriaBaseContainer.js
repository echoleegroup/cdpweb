import React from 'react';
import CriteriaBaseBodyContainer from './CriteriaBaseBodyContainer';

export default class CriteriaBaseContainer extends React.PureComponent {
  render() {
    let props = this.props;
    let ComponentHeadline = props.ComponentHeadline;
    let ComponentSideHead = props.ComponentSideHead;
    let ComponentControlButton = props.ComponentControlButton;
    return (
      <div className="table_block">
        <ComponentHeadline/>
        <ComponentSideHead/>
        <CriteriaBaseBodyContainer styleClass={props.styleClass}
                                   ComponentCriteriaBody={props.ComponentCriteriaBody}
                                   ComponentCriteriaBundleContainer={props.ComponentCriteriaBundleContainer}/>
        <ComponentControlButton/>
      </div>
    );
  };
};