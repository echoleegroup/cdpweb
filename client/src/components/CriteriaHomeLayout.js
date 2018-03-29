import React  from 'react';
import {List, Map} from 'immutable';
import {values, assign} from 'lodash';
import AlertMessenger from './AlertMessenger';

export default class CriteriaHomeLayout extends React.PureComponent {
  constructor(props) {
    super(props);
    this.STEPS = this.getStepMapper();
    this.params = this.props.match.params;
    this.state = {
      isLoaded: false,
      step: values(this.STEPS)[0],
      featureOptions: [],
      criteria: Map(this.getDefaultStepCriteria(this.STEPS)),
      output: {
        selectedFeature: List()
      },
      message_success: undefined,
      message_warning: undefined,
      message_error: undefined
    };
    this.ComponentContent = this.ComponentContent.bind(this);
    this.ComponentSideBar = this.ComponentSideBar.bind(this);
  };

  componentWillMount() {

    this.setStep = (targetStep) => {
      // console.log('IntegratedAnalysisHome::stepTo: ' , targetStep);

      this.setState({
        step: targetStep
      });
    };

    this.stepTo = (targetStep) => {
      return () => {
        //this.setStep(targetStep);
        this.getStepForwardHandler(this.state.step)(targetStep);
      };
    };

    this.stepToHandler = (targetStep) => {
      return this.getStepForwardHandler(this.state.step)(targetStep);
    };

    this.storeCurrentStepComponent = (e) => {
      this.stepComponent = e;
    };

    //step forward handler
    this.stepForwardHandler = (targetStep) => {
      this.setStep(targetStep);
    };

    this.criteriaStepForwardHandler = (targetStep) => {
      let isReady = this.stepComponent.isReadyToLeave();

      if (isReady) {
        let criteria = this.stepComponent.getCriteria();
        this.setState(prevState => {
          return {
            criteria: prevState.criteria.set(prevState.step, criteria),
            step: targetStep,
            message_error: undefined
          };
        });
      } else {
        this.setState({
          message_error: '請先完成目前條件編輯'
        })
      }
    };

    this.featurePickerStepForwardHandler = (targetStep) => {
      let exportConfig = this.stepComponent.getExportOutputConfig();
      this.setState({
        output: exportConfig,
        step: targetStep
      });
    };

    // message adaptor
    this.alertMessageAdaptor = (message_error, message_warning, message_success) => {
      this.setState({
        message_error,
        message_warning,
        message_success
      });
    };

    // execute
    this.fetchPreparedData(data => {
      this.setState(assign({
        isLoaded: true,
      }, data));
    });
  };

  getDefaultStepCriteria(steps) {
    return {};
  };

  getStepMapper() {
    return {};
  };

  fetchPreparedData(callback) {
    callback({
      featureOptions: []
    });
  };

  getStepForwardHandler(step) {
    return (currComp, allowHandler, denyHandler) => {};
  }

  render() {
    let ComponentContent = this.ComponentContent;
    let ComponentSideBar = this.ComponentSideBar;
    return (
      <div className="row">
        {/*<!-- 左欄 Start -->*/}
        <div className="col-md-8 col-sm-7 col-xs-12">
          <AlertMessenger message_error={this.state.message_error}/>
          <ComponentContent/>
        </div>
        {/*<!-- 右欄 Start -->*/}
        <div className="col-md-4 col-sm-5 col-xs-12">
          {/*<!-- table set Start -->*/}
          <ComponentSideBar/>
        </div>
      </div>
    );
  };

  ComponentContent(props) {
    return <div/>
  };

  ComponentSideBar(props) {
    return <div/>
  };
};