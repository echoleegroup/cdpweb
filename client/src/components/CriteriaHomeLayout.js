import React  from 'react';
import Loadable from 'react-loading-overlay';
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
        this.stepForward(this.state.step, targetStep);
      };
    };

    this.stepToHandler = (targetStep) => {
      this.stepForward(this.state.step, targetStep);
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
    this.changeViewHandler = (isPreview) => {
      /*
      this.setState({
        message_error: undefined,
        message_warning: undefined,
        message_success: undefined
      });
      */
    };

    this.pageLoading = () => {
      this.setState({
        isLoaded: false
      });
    };

    this.pageUnloading = () => {
      this.setState({
        isLoaded: true
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

  stepForward(step, targetStep) {
    return (currComp) => {};
  }

  render() {
    let ComponentContent = this.ComponentContent;
    let ComponentSideBar = this.ComponentSideBar;
    return (
      <Loadable active={!this.state.isLoaded} spinner>
        <div className="row">
          <div className="col-md-12 col-sm-12 col-xs-12">
            <AlertMessenger message_error={this.state.message_error}/>
          </div>
        </div>
        <div className="row">
          {/*<!-- 左欄 Start -->*/}
          <div className="col-md-8 col-sm-7 col-xs-12">
            <ComponentContent/>
          </div>
          {/*<!-- 右欄 Start -->*/}
          <div className="col-md-4 col-sm-5 col-xs-12">
            {/*<!-- table set Start -->*/}
            <ComponentSideBar/>
          </div>
        </div>
      </Loadable>
    );
  };

  ComponentContent(props) {
    return <div/>
  };

  ComponentSideBar(props) {
    return <div/>
  };
};