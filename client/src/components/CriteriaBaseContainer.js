import React from 'react';
import CriteriaBaseBodyContainer from './CriteriaBaseBodyContainer';
import AlertMessenger from "./AlertMessenger";

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
        <AlertMessenger message_warning={props.message_warning}
                        message_error={props.message_error}/>
        <ComponentControlButton/>
      </div>
    );
  };
};