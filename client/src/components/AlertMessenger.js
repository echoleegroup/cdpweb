import React from 'react';
import {isEmpty} from 'lodash';

export default class AlertMessenger extends React.PureComponent {
  render() {
    let props = this.props;
    let SuccessModal = isEmpty(props.message_success)? null: (
      <div className="isa_success">
        <i className="fa fa-check-circle"/>{props.message_success}
      </div>
    );
    let WarningModal = isEmpty(props.message_warning)? null: (
      <div className="isa_warning">
        <i className="fa fa-exclamation-circle"/>{props.message_warning}
      </div>
    );
    let DangerModal = isEmpty(props.message_error)? null: (
      <div className="isa_error">
        <i className="fa fa-times-circle"/>{props.message_error}
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