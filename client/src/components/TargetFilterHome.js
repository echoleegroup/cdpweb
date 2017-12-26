import React  from 'react';
import TargetFilterPrediction from './TargetFilterPrediction';
import TargetFilterIllustration from './TargetFilterIllustration';

export default class PreferredTargetHome extends React.Component {
  render() {
    return (
      <div className="row">
        {/*<!-- 左欄 Start -->*/}
        <div className="col-md-8 col-sm-7 col-xs-12">
          <TargetFilterPrediction/>
        </div>
        {/*<!-- 右欄 Start -->*/}
        <div className="col-md-4 col-sm-5 col-xs-12">
          {/*<!-- table set Start -->*/}
          <TargetFilterIllustration/>
        </div>
      </div>
    );
  }
}

//ReactDOM.render((<PreferredTarget />), document.getElementById('custom-search'));