import React  from 'react';
import BodyLayout from './BodyLayout';
import CustomTargetFilterWorker from './CustomTargetFilterWorker';
import CustomTargetFilterIllustration from './CustomTargetFilterIllustration';

export default class CustomTargetFilterHome extends BodyLayout {

  ContentComponent() {
    return <CustomTargetFilterWorker params={this.params}/>
  };

  SideBarComponent() {
    return <CustomTargetFilterIllustration params={this.params}/>
  };

  // render() {
  //   return (
  //     <div className="row">
  //       {/*<!-- 左欄 Start -->*/}
  //       <div className="col-md-8 col-sm-7 col-xs-12">
  //         <CustomTargetFilterWorker params={this.params}/>
  //       </div>
  //       {/*<!-- 右欄 Start -->*/}
  //       <div className="col-md-4 col-sm-5 col-xs-12">
  //         {/*<!-- table set Start -->*/}
  //         <CustomTargetFilterIllustration params={this.params}/>
  //       </div>
  //     </div>
  //   );
  // }
}

//ReactDOM.render((<PreferredTarget />), document.getElementById('custom-search'));