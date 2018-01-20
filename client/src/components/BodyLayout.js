import React  from 'react';

export default class BodyLayout extends React.PureComponent {
  constructor(props) {
    super(props);
    this.params = this.props.match.params;
  };

  render() {
    return (
      <div className="row">
        {/*<!-- 左欄 Start -->*/}
        <div className="col-md-8 col-sm-7 col-xs-12">
          {this.ContentComponent()}
        </div>
        {/*<!-- 右欄 Start -->*/}
        <div className="col-md-4 col-sm-5 col-xs-12">
          {/*<!-- table set Start -->*/}
          {this.SideBarComponent()}
        </div>
      </div>
    );
  };

  ContentComponent() {
    return <div/>
  };

  SideBarComponent() {
    return <div/>
  };
};