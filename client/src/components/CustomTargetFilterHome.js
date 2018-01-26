import React  from 'react';
import BodyLayout from './BodyLayout';
import CustomTargetFilterPrimaryContent from './CustomTargetFilterPrimaryContent';
import CustomTargetFilterIllustration from './CustomTargetFilterIllustration';

export default class CustomTargetFilterHome extends BodyLayout {

  ComponentContent() {
    return <CustomTargetFilterPrimaryContent params={this.params}/>
  };

  ComponentSideBar() {
    return <CustomTargetFilterIllustration params={this.params}/>
  };
};