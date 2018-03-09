import React from 'react';
import {isEmpty} from 'lodash';
import CriteriaBaseBodyContainer from './CriteriaBaseBodyContainer';
import CriteriaComboBundleList from './CriteriaComboBundleList';

const ComponentEmptyBody = (props) => {
  return (<p>無條件設定</p>);
};

const ComponentContentBody = (props) => {
  return (
    <div className="level form-inline">
      <CriteriaComboBundleList
        isPreview={true}
        criteria={props.criteria}
        ComponentCriteriaBundleContainer={props.ComponentCriteriaBundleContainer}/>
    </div>
  );
};

export default class CriteriaBaseBodyContainerMute extends React.PureComponent {
  render() {
    let mapToProps = {};
    if (isEmpty(this.props.criteria)) {
      mapToProps = {
        styleClass: 'nocondition',
        ComponentCriteriaBody: ComponentEmptyBody
      };
    } else {
      mapToProps = {
        styleClass: 'condition',
        ComponentCriteriaBody: ComponentContentBody,
        criteria: this.props.criteria,
        ComponentCriteriaBundleContainer: this.props.ComponentCriteriaBundleContainer
      };
    }
    return <CriteriaBaseBodyContainer {...mapToProps}/>
  };
};