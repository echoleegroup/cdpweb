import React from 'react';
import Loader from 'react-loader';
import {assign} from 'lodash';
import CriteriaBundle from './CriteriaBundle';
import CriteriaAssignment from './CriteriaAssignment';
import IntegratedAnalysisAction from "../actions/integrated-analysis-action";

const OPERATOR_OPTIONS =  {
  and: '全部',
  or: '任一',
  not: '皆不'
};
export default class CriteriaTransactionBundle extends CriteriaBundle {
  constructor(props) {
    super(props);
    this.OPERATOR_OPTIONS = OPERATOR_OPTIONS;
    // state from super:
    // this.state = {
    //   isLoaded: true,
    //   properties: Map(this.getBundleProperties(props.criteria))
    // };
    this.state = assign(this.state, {
      isLoaded: false,
      features: [],
      featureRefCodeMap: {}
    });
  };

  componentWillMount() {
    super.componentWillMount();

    this.toAssignCriteria = () => {
      this.criteriaAssignmentModal.openModal(this.insertCriteriaState);
    };

    this.fetchFeatureData = callback => {
      IntegratedAnalysisAction.getTransactionCriteriaFeatures(
        this.getPropertyState('ref'), callback);
    };

    this.fetchPreparedData = () => {
      this.fetchFeatureData(({features, featureRefCodeMap}) => {
        this.setState({
          isLoaded: true,
          features,
          featureRefCodeMap});
      });
    };

    this.fetchPreparedData();
  };

  componentWillUnmount() {
    console.log('CriteriaDetailBundle: componentWillUnmount', this.state);
    super.componentWillUnmount()
  };

  ComponentCriteriaBody() {
    return (
      <div className="head">
        以下條件的明細記錄{this.CriteriaOperatorSelector()}符合
        {this.ComponentCriteriaBodyTail()}
      </div>
    );
  };

  ComponentCriteriaBodyTail() {
    return (
      <div className="sub_conditon">
        指定參考：<span>{this.getPropertyState('ref_label')}</span>
      </div>
    );
  };

  ComponentCustomized() {
    if (this.props.isPreview) {
      return <div/>;
    }

    let mapToProps = {
      features: this.state.features || [],
      featureRefCodeMap: this.state.featureRefCodeMap || {}
    };
    return (
      <Loader loaded={this.state.isLoaded}>
        <CriteriaAssignment {...mapToProps} ref={(e) => {
          this.criteriaAssignmentModal = e;
        }}/>
      </Loader>
    );
  };
};