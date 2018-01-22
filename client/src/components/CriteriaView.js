import React from 'react';

import CriteriaComboBundleList from './CriteriaComboBundleList';

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
    /**
     * DO NOT user functional component, which would enforce unmount/re-mount the component
     */
    return (
      <div className="table_block">
        {this.MainTitle()}
        {this.SubTitle()}
        <div className={this.props.styleClass}>
          {this.CriteriaBody()}
        </div>
        {this.props.controlButtonRender()}
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
      addCriteriaField: this.props.addCriteriaField
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

  MainTitle() {
    if (this.props.displayOptions.main_title) {
      return <h2>{this.props.displayOptions.main_title}</h2>
    } else {
      return null;
    }
  }

  SubTitle() {
    if (this.props.displayOptions.sub_title) {
      return <h3>{this.props.displayOptions.sub_title}</h3>
    } else {
      return null;
    }
  }
}