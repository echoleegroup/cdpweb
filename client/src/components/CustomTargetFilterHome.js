import React  from 'react';
import BodyLayout from './BodyLayout';
import CustomTargetFilterPrimaryContent from './CustomTargetFilterPrimaryContent';
import CustomTargetFilterIllustration from './CustomTargetFilterIllustration';

export default class CustomTargetFilterHome extends BodyLayout {

  ContentComponent() {
    return <CustomTargetFilterPrimaryContent params={this.params}/>
  };

  SideBarComponent() {
    return <CustomTargetFilterIllustration params={this.params}/>
  };
};