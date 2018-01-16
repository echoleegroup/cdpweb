import React  from 'react';
import CustomTargetFilterWorker from './CustomTargetFilterWorker';
import CustomTargetFilterIllustration from './CustomTargetFilterIllustration';

export default class CustomTargetFilterHome extends React.PureComponent {
  constructor(props) {
    super(props);
    this.params = this.props.match.params;
  };

  render() {
    return (
      <div className="row">
        {/*<!-- 左欄 Start -->*/}
        <div className="col-md-8 col-sm-7 col-xs-12">
          <CustomTargetFilterWorker params={this.params}/>
        </div>
        {/*<!-- 右欄 Start -->*/}
        <div className="col-md-4 col-sm-5 col-xs-12">
          {/*<!-- table set Start -->*/}
          <CustomTargetFilterIllustration params={this.params}/>
        </div>
      </div>
    );
  }
}

//ReactDOM.render((<PreferredTarget />), document.getElementById('custom-search'));