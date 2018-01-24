import React from 'react';

import CriteriaComboBundleList from '../CriteriaComboBundleList';

export default class CriteriaView extends React.PureComponent {
  constructor(props) {
    super(props);
  }

  componentWillMount() {
    // console.log('CriteriaView::componentWillMount');
    this.criteriaGathering = () => {
      let c = this.criteriaWrapper.criteriaGathering();
      // console.log('CriteriaView::criteriaGathering: ', c);
      return c;
    }
  }

  componentWillUnmount() {
    console.log('CriteriaView::componentWillUnmount');
  };

  render() {
    let ComponentHeadline = this.props.ComponentHeadline;
    let ComponentSideHead = this.props.ComponentSideHead;
    let ComponentControlButton = this.props.ComponentControlButton;
    /**
     * DO NOT user functional component, which would enforce unmount/re-mount the component
     */
    return (
      <div className="table_block">
        {ComponentHeadline}
        {ComponentSideHead}
        <div className={this.props.styleClass}>
          {this.CriteriaBody()}
        </div>
        {ComponentControlButton}
      </div>
    );
  };

  CriteriaBody() {
    const mapToProps = {
      isPreview: this.props.isPreview,
      criteria: this.props.criteria,
      // refOptions: this.props.refOptions,
      // fieldDictionary: this.props.fieldDictionary,
      // folderDictionary: this.props.folderDictionary,
      assignCriteria: this.props.assignCriteria
    };
    return (
      <form className="form-horizontal">
        <div className="level form-inline">
          <CriteriaComboBundleList
            {...mapToProps}
            ref={(e) => {
              this.criteriaWrapper = e;
            }}/>
        </div>
      </form>
    );
  }
}