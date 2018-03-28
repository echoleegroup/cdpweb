import React from 'react';

export default class CriteriaBaseBodyContainer extends React.PureComponent {
  // shouldComponentUpdate(nextProps, nextState) {
  //   return (this.props.isPreview !== nextProps.isPreview);
  // };

  render() {
    let props = this.props;
    let ComponentCriteriaBody = props.ComponentCriteriaBody;
    return (
      <div className={props.styleClass}>
        <ComponentCriteriaBody criteria={this.props.criteria}
                               ComponentCriteriaBundleContainer={this.props.ComponentCriteriaBundleContainer}/>
      </div>
    );
  };
};