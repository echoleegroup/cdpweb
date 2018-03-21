import React from 'react';
import Loader from 'react-loader';
import {assign} from 'lodash';
import CriteriaBundle from './CriteriaBundle';
import CriteriaAssignment from './CriteriaAssignment';
import IntegratedAnalysisAction from "../actions/integrated-analysis-action";
import CriteriaTransactionBundle from "./CriteriaTransactionBundle";
import TagPickerModal from "./TagPickerModal";

const OPERATOR_OPTIONS =  {
  and: '全部',
  or: '任一'
};
export default class CriteriaTagBundle extends CriteriaBundle {
  constructor(props) {
    super(props);
    this.OPERATOR_OPTIONS = OPERATOR_OPTIONS;
    this.BUNDLE_TYPE_LABEL = '標籤條件';
    // state from super:
    // this.state = {
    //   isLoaded: true,
    //   properties: Map(this.getBundleProperties(props.criteria))
    // };
    this.state = assign(this.state, {
      // isLoaded: false,
      features: [],
      featureRefCodeMap: {}
    });
  };

  componentWillMount() {
    super.componentWillMount();

    this.pickerOptionFilter = (keyword, callback) => {
      // console.log('pickerOptionFilter');
      this.fetchFeatureData(keyword, callback);
    };

    this.insertCriteriaState = (criteria) => {
      // console.log('CriteriaBundle:insertCriteria: ', criteria);
      this.setState(prevState => ({
        properties: prevState.properties.set('criteria', prevState.properties.get('criteria').push(criteria))
      }));
    };
    // super.componentWillMount();
    //
    // this.fetchPreparedData = () => {
    //   this.fetchFeatureData(({features, featureRefCodeMap}) => {
    //     this.setState({
    //       isLoaded: true,
    //       features,
    //       featureRefCodeMap});
    //   });
    // };
    //
    // this.fetchPreparedData();
  };

  fetchFeatureData(keyword, callback) {
    // console.log('fetchFeatureData');
    IntegratedAnalysisAction.getTagCriteriaFeatures(
      this.getPropertyState('ref'), keyword, callback);
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

  addCriteriaClickHandler() {
    this.slaveModal.openModal(this.insertCriteriaState);
  };

  // ComponentBundleBodyTail(props) {
  //   return (
  //     <div className="sub_conditon">
  //       指定參考：<span>{props.criteria.ref_label}</span>
  //     </div>
  //   );
  // };

  ComponentBundleBodyTail(props) {
    return (
      <div className="sub_conditon">
        來源：<span>{props.criteria.ref_label}</span>
      </div>
    );
  };

  ComponentCustomized(props) {
    let mapToProps = {
      title: this.getPropertyState('ref_label'),
      dataHandler: this.fetchFeatureData.bind(this),
      // dataHandler: this.pickerOptionFilter,
      // loaded: this.state.isLoaded
      // features: this.state.features || [],
      // featureRefCodeMap: this.state.featureRefCodeMap || {}
    };
    return (
      <TagPickerModal {...mapToProps} ref={(e) => {
        this.slaveModal = e;
      }}/>
    );
  };

  ComponentButtonInsertCriteria(props) {
    if (!props.isPreview) {
      return (
        <div className="add_condition">{/*<!-- 加條件 條件組合 -->*/}
          <button type="button" className="btn btn-warning" onClick={props.addCriteriaClickHandler}>
            <i className="fa fa-plus" aria-hidden="true"/>加標籤
          </button>
        </div>
      );
    } else {
      return null;
    }
  };
};