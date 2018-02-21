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
    this.BUNDLE_TYPE_LABEL = '明細記錄';
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

  fetchFeatureData(callback) {
    IntegratedAnalysisAction.getTransactionCriteriaFeatures(
      this.getPropertyState('ref'), callback);
  };
  //
  // componentWillUnmount() {
  //   console.log('CriteriaTransactionBundle: componentWillUnmount', this.state);
  //   super.componentWillUnmount()
  // };

  // render() {
  //   // console.log('CriteriaTransactionBundle render');
  //   return super.render();
  // };

  ComponentCriteriaBody(props) {
    let CriteriaOperatorSelector = this.CriteriaOperatorSelector.bind(this);
    let ComponentCriteriaBodyTail = this.ComponentCriteriaBodyTail.bind(this);
    return (
      <div className="head">
        以下{this.BUNDLE_TYPE_LABEL}<CriteriaOperatorSelector/>符合
        <ComponentCriteriaBodyTail/>
      </div>
    );
  };

  ComponentCriteriaBodyTail(props) {
    return (
      <div className="sub_conditon">
        指定參考：<span>{props.criteria.ref_label}</span>
      </div>
    );
  };

  ComponentCustomized(props) {
    // if (this.props.isPreview) {
    //   return <div/>;
    // }

    let mapToProps = {
      features: this.state.features || [],
      featureRefCodeMap: this.state.featureRefCodeMap || {}
    };
    return (
      <Loader loaded={this.state.isLoaded}>
        <CriteriaAssignment {...mapToProps} ref={(e) => {
          this.slaveModal = e;
        }}/>
      </Loader>
    );
  };
};