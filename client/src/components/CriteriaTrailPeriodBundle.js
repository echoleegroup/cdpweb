import React from 'react';
import monent from 'moment';
import Loader from 'react-loader';
import {assign} from 'lodash';
import Flatpickr from 'react-flatpickr';
import CriteriaBundle from './CriteriaBundle';
import CriteriaAssignment from './CriteriaAssignment';
import IntegratedAnalysisAction from "../actions/integrated-analysis-action";
import CriteriaTransactionBundle from "./CriteriaTransactionBundle";
import TagPickerModal from "./TagPickerModal";

const OPERATOR_OPTIONS =  {
  and: '全部',
  or: '任一'
};
export default class CriteriaTrailPeriodBundle extends CriteriaTransactionBundle {
  constructor(props) {
    super(props);
    this.OPERATOR_OPTIONS = OPERATOR_OPTIONS;
    this.BUNDLE_TYPE_LABEL = '線上足跡';
    // state from super:
    // this.state = {
    //   isLoaded: true,
    //   properties: Map(this.getBundleProperties(props.criteria))
    // };
    let periodStart = monent().add(-1, 'day').add(-1, 'month').startOf('day');
    let periodEnd = monent().add(-1, 'day').startOf('day');
    this.state = assign(this.state, {
      // isLoaded: false,
      // features: [],
      // featureRefCodeMap: {},
      properties: this.state.properties.merge({
        period_start_value: props.criteria.period_start_value || periodStart.valueOf(),
        period_start_label: props.criteria.period_start_label || periodStart.format('YYYY/MM/DD'),
        period_end_value: props.criteria.period_end_value || periodEnd.valueOf(),
        period_end_label: props.criteria.period_end_label || periodEnd.format('YYYY/MM/DD')
      })
    });
  };

  componentWillMount() {
    super.componentWillMount();

    // this.pickerOptionFilter = (keyword, callback) => {
    //   // console.log('pickerOptionFilter');
    //   this.fetchFeatureData(keyword, callback);
    // };

    this.insertCriteriaState = (tagList) => {
      console.log('CriteriaTagBundle:insertCriteriaState: ', tagList);
      this.setState(prevState => ({
        properties: prevState.properties.set('criteria', prevState.properties.get('criteria').concat(tagList))
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

  fetchPreparedData(callback) {
    IntegratedAnalysisAction.getTrailPeriodCriteriaFeatures(
      this.getPropertyState('ref'), data => {
        console.log('fetch trail period data: ', data);
        this.setState({
          features: data,
          isLoaded: true
        })
      });
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

  ComponentBundleBodyFront(props) {
    return (
      <div>
        <Flatpickr options={{
          clickOpens: !this.props.isPreview,
          dateFormat: "Y/m/d",
          defaultDate: new Date(this.state.properties.get('period_start_value')),
          onChange: (selectedDates, dateStr) => {
            this.setState(prevState => ({
              properties: prevState.properties.merge({
                period_start_value: selectedDates[0].getTime(),
                period_start_label: dateStr
              })
            }));
          }
        }}/>
        <span> ~ </span>
        <Flatpickr options={{
          clickOpens: !this.props.isPreview,
          dateFormat: "Y/m/d",
          defaultDate: new Date(this.state.properties.get('period_end_value')),
          onChange: (selectedDates, dateStr) => {
            this.setState(prevState => ({
              properties: prevState.properties.merge({
                period_end_value: selectedDates[0].getTime(),
                period_end_label: dateStr
              })
            }));
          }
        }}/>期間內，下列{this.BUNDLE_TYPE_LABEL}
      </div>
    );
  }

  // ComponentBundleBodyTail(props) {
  //   return (
  //     <div className="sub_conditon">
  //       來源：<span>{props.criteria.ref_label}</span>
  //     </div>
  //   );
  // };

  // ComponentCustomized(props) {
  //   let mapToProps = {
  //     title: this.getPropertyState('ref_label'),
  //     dataHandler: this.fetchFeatureData.bind(this),
  //     // dataHandler: this.pickerOptionFilter,
  //     // loaded: this.state.isLoaded
  //     // features: this.state.features || [],
  //     // featureRefCodeMap: this.state.featureRefCodeMap || {}
  //   };
  //   return (
  //     <TagPickerModal {...mapToProps} ref={(e) => {
  //       this.slaveModal = e;
  //     }}/>
  //   );
  // };

  // ComponentChildCriteriaBlock(props) {
  //   return (
  //     <div className="level form-inline">
  //       <div className="con-option">
  //         <div className="tag customize">
  //           <ul>
  //             {this.state.properties.get('criteria').map((_criteria, index) => {
  //               return this.ComponentChildCriteria(_criteria, index);
  //             })}
  //           </ul>
  //         </div>
  //       </div>
  //     </div>
  //   );
  // };

  // ComponentButtonInsertCriteria(props) {
  //   if (!props.isPreview) {
  //     return (
  //       <div className="add_condition">{/*<!-- 加條件 條件組合 -->*/}
  //         <button type="button" className="btn btn-warning" onClick={props.addCriteriaClickHandler}>
  //           <i className="fa fa-plus" aria-hidden="true"/>加標籤
  //         </button>
  //       </div>
  //     );
  //   } else {
  //     return null;
  //   }
  // };
};