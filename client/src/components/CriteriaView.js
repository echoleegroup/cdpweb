import React from 'react';
import Loader from 'react-loader';
import CriteriaFieldPicker from './CriteriaFieldPicker';

import CriteriaComboBundleList from './CriteriaComboBundleList';

export default class CriteriaView extends React.PureComponent {
  constructor(props) {
    super(props);
  }

  getBodyStyleClass() {
    return null;
  };

  render() {
    /**
     * DO NOT user functional component, which would enforce unmount/re-mount the component
     */
    return (
      <div className="table_block">
        {this.MainTitle()}
        {this.SubTitle()}
        <div className={this.getBodyStyleClass()}>
          {this.CriteriaBody()}
        </div>
        {this.ControlButtonRender()}
      </div>
    );
  };

  CriteriaBody() {
    return (
      <form className="form-horizontal">
        <div className="level form-inline">
          <CriteriaComboBundleList
            {...this.props}
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

  ControlButtonRender() {
    return (
      <div/>
    );
  };
}