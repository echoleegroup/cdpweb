import React from 'react';
import monent from 'moment';
import {assign} from 'lodash';
import Flatpickr from 'react-flatpickr';
import integratedAnalysisAction from "../actions/integrated-analysis-action";
import CriteriaBundleTransaction from "./CriteriaBundleTransaction";

const OPERATOR_OPTIONS =  {
  and: '全部',
  or: '任一'
};
export default class CriteriaBundleTrailPeriod extends CriteriaBundleTransaction {
  constructor(props) {
    super(props);
    this.OPERATOR_OPTIONS = OPERATOR_OPTIONS;
    this.BUNDLE_TYPE_LABEL = '線上足跡';

    let periodStart = monent().add(-1, 'day').add(-1, 'month').startOf('day');
    let periodEnd = monent().add(-1, 'day').startOf('day');

    this.state = assign(this.state, {
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

    this.insertCriteriaState = (tagList) => {
      // console.log('CriteriaBundleTag:insertCriteriaState: ', tagList);
      this.setState(prevState => ({
        properties: prevState.properties.set('criteria', prevState.properties.get('criteria').concat(tagList))
      }));
    };
  };

  fetchPreparedData(callback) {
    integratedAnalysisAction.getTrailPeriodCriteriaFeatures(
      this.getPropertyState('ref'), data => {
        // console.log('fetch trail period data: ', data);
        this.setState({
          features: data,
          isLoaded: true
        })
      });
  };

  addCriteriaClickHandler() {
    this.slaveModal.openModal(this.insertCriteriaState);
  };

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
};