import React from 'react';
import {isEmpty} from 'lodash';
import {Alert} from 'react-bootstrap';
import CriteriaBaseBodyContainer from './CriteriaBaseBodyContainer';

export default class CriteriaBaseContainer extends React.PureComponent {
  // componentWillReceiveProps(nextProps) {
  //   console.log('nextProps: ', nextProps);
  // };

  render() {
    let props = this.props;
    let ComponentHeadline = props.ComponentHeadline;
    let ComponentSideHead = props.ComponentSideHead;
    let ComponentControlButton = props.ComponentControlButton;

    // console.log('styleClass: ', props.styleClass);
    // console.log('ComponentAlert', ComponentAlert);
    // console.log('ComponentControlButton', ComponentControlButton);
    // console.log('ComponentCriteriaBundleContainer', props.ComponentCriteriaBundleContainer);

    return (
      <div className="table_block">
        <ComponentHeadline/>
        <ComponentSideHead/>
        <CriteriaBaseBodyContainer styleClass={props.styleClass}
                                   ComponentCriteriaBody={props.ComponentCriteriaBody}
                                   ComponentCriteriaBundleContainer={props.ComponentCriteriaBundleContainer}/>
        <ComponentAlert message_warning={props.message_warning}
                        message_error={props.message_error}/>
        <ComponentControlButton/>
      </div>
    );
  };

  ComponentAlert(props) {

  }
};

class ComponentAlert extends React.PureComponent {
  render() {
    let props = this.props;
    let SuccessModal = isEmpty(props.message_success)? null: (
      <div className="isa_success">
        <i className="fa fa-check-circle"/>{props.message_success}
      </div>
    );
    let WarningModal = isEmpty(props.message_warning)? null: (
      <div className="isa_warning">
        <i className="fa fa-check-circle"/>{props.message_warning}
      </div>
    );
    let DangerModal = isEmpty(props.message_error)? null: (
      <div className="isa_error">
        <i className="fa fa-check-circle"/>{props.message_error}
      </div>
    );

    return (
      <div>
        {SuccessModal}
        {WarningModal}
        {DangerModal}
      </div>
    );
  }
}