import React  from 'react';
import AlertMessenger from './AlertMessenger';
import CustomTargetFilterPrimaryContent from './CustomTargetFilter';
import CustomTargetFilterIllustration from './CustomTargetIllustration';

export default class CustomTargetLayout extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      message_error: undefined,
      message_warning: undefined,
      message_success: undefined
    };
  };

  render() {
    let params = this.props.match.params;
    return (
      <div>
        <div className="row">
          <div className="col-md-12 col-sm-12 col-xs-12">
            <AlertMessenger message_error={this.state.message_error}
                            message_warning={this.state.message_warning}
                            message_success={this.state.message_success}/>
          </div>
        </div>
        <div className="row">
          {/*<!-- 左欄 Start -->*/}
          <div className="col-md-8 col-sm-7 col-xs-12">
            <CustomTargetFilterPrimaryContent params={params}/>
          </div>
          {/*<!-- 右欄 Start -->*/}
          <div className="col-md-4 col-sm-5 col-xs-12">
            {/*<!-- table set Start -->*/}
            <CustomTargetFilterIllustration params={params}/>
          </div>
        </div>
      </div>
    );
  };
};