import React  from 'react';
import TargetFilterPrediction from './CustomTargetFilterPrediction';
import TargetFilterIllustration from './CustomTargetFilterIllustration';

export default class PreferredTargetHome extends React.PureComponent {
  constructor(props) {
    super(props);
    this.params = this.props.match.params;
  };

  render() {
    return (
      <div className="row">
        {/*<!-- 左欄 Start -->*/}
        <div className="col-md-8 col-sm-7 col-xs-12">
          <TargetFilterPrediction params={this.params}/>
        </div>
        {/*<!-- 右欄 Start -->*/}
        <div className="col-md-4 col-sm-5 col-xs-12">
          {/*<!-- table set Start -->*/}
          <TargetFilterIllustration params={this.params}/>
        </div>
      </div>
    );
  }
}

//ReactDOM.render((<PreferredTarget />), document.getElementById('custom-search'));