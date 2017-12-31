import React from 'react';
import Loader from 'react-loader';
import CriteriaFieldPicker from './CriteriaFieldPicker';

import CriteriaComboBundleList from './CriteriaComboBundleList';

export default class CriteriaView extends React.PureComponent {
  constructor(props) {
    super(props);
  }

  componentWillMount() {
    // console.log('CriteriaView::componentWillMount');
    this.getCriteria = () => {
      let c = this.criteriaWrapper.getCriteria();
      // console.log('CriteriaView::getCriteria: ', c);
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
        <div className="btn-block center-block">
          {this.props.controlButtonRender()}
        </div>
      </div>
    );
  };

  CriteriaBody() {
    const mapToProps = {
      isPreview: this.props.isPreview,
      criteria: this.props.criteria,
      refOptions: this.props.refOptions,
      refFields: this.props.refFields,
      refFolds: this.props.refFolds,
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
    if (this.props.moduleOptions.main_title) {
      return <h2>{this.props.moduleOptions.main_title}</h2>
    } else {
      return null;
    }
  }

  SubTitle() {
    if (this.props.moduleOptions.sub_title) {
      return <h3>{this.props.moduleOptions.sub_title}</h3>
    } else {
      return null;
    }
  }
}