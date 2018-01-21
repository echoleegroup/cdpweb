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
};