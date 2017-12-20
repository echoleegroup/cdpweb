import React  from 'react';
import ReactDOM  from 'react-dom';
import PreferredTargetAction from './components/PreferredTargetAction';
import PreferredTargetIllustration from './components/PreferredTargetIllustration';

class PreferredTarget extends React.Component {
  render() {
    return (
      <div className="row">
        {/*<!-- 左欄 Start -->*/}
        <div className="col-md-8 col-sm-7 col-xs-12">
          <PreferredTargetAction/>
        </div>
        {/*<!-- 右欄 Start -->*/}
        <div className="col-md-4 col-sm-5 col-xs-12">
          {/*<!-- table set Start -->*/}
          <PreferredTargetIllustration/>
        </div>
      </div>
    );
  }
}

ReactDOM.render((<PreferredTarget />), document.getElementById('custom-search'));