import React  from 'react';
import CriteriaHomeLayout from './CriteriaHomeLayout';
import CustomTargetFilterPrimaryContent from './CustomTargetFilterPrimaryContent';
import CustomTargetFilterIllustration from './CustomTargetFilterIllustration';

export default class CustomTargetFilterHome extends CriteriaHomeLayout {

  ComponentContent() {
    return <CustomTargetFilterPrimaryContent params={this.params}/>
  };

  ComponentSideBar() {
    return <CustomTargetFilterIllustration params={this.params}/>
  };
};