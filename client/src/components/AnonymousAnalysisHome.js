import React from 'react';
import Loader from 'react-loader';
import BodyLayout from "./BodyLayout";
import {List, Map} from 'immutable';
import {assign} from 'lodash';
import AnonymousAnalysisCriteriaTrail from "./AnonymousAnalysisCriteriaTrail";
import anonymousAction from '../actions/anonymous-analysis-action';
import {getDate} from '../utils/date-util';
import AnonymousAnalysisCriteriaTag from "./AnonymousAnalysisCriteriaTag";
import AnonymousAnalysisCriteriaOverview from "./AnonymousAnalysisCriteriaOverview";
import AnonymousAnalysisOutputFeaturePicker from "./AnonymousAnalysisOutputFeaturePicker";

const criteriaStepForwardHandler = (targetStep, _that) => {
  let isReady = _that.stepComponent.isReadyToLeave();

  if (isReady) {
    let criteria = _that.stepComponent.getCriteria();
    _that.setState(prevState => {
      return {
        criteria: prevState.criteria.set(prevState.step, criteria)
      };
    });
    _that.setStep(targetStep);
  } else {
    window.alert('Please confirm your criteria before leaving.');
  }
};

const featurePickerStepForwardHandler = (targetStep, _that) => {
  let exportConfig = _that.stepComponent.getExportOutputConfig();
  _that.setState(prevState => ({
    output: exportConfig,
    step: targetStep
  }));
};

const stepForwardHandler = (targetStep, _that) => {
  _that.setStep(targetStep);
};

const STEPS = {
  step1: 'tag',
  step2: 'trail',
  step3: '_preview',
  step4: '_features'
};

const STEP_FORWARD_HANDLERS = Object.freeze({
  [STEPS.step1]: criteriaStepForwardHandler,
  [STEPS.step2]: criteriaStepForwardHandler,
  [STEPS.step3]: stepForwardHandler,
  [STEPS.step4]: featurePickerStepForwardHandler,
});

export default class AnonymousAnalysisHome extends BodyLayout {
  constructor(props) {
    super(props);

    let today = getDate();

    this.state = {
      isLoaded:false,
      step: STEPS.step1,
      featureOptions: [],
      // relativeSetOptions: [],
      criteria: Map({
        [STEPS.step1]: [],
        [STEPS.step2]: []
      }),
      output: {
        selectedFeature: List()
        // selectedRelativeId: List(),
        // periodStart: today.value,
        // periodStartLabel: today.value_label,
        // periodEnd: today.value,
        // periodEndLabel: today.value_label,
      }
    };
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
        STEP_FORWARD_HANDLERS[this.state.step](targetStep, this);
      };
    };

    this.stepToHandler = () => {
      return (targetStep) => {
        STEP_FORWARD_HANDLERS[this.state.step](targetStep, this);
      };
    };

    this.storeCurrentStepComponent = (e) => {
      this.stepComponent = e;
    };

    this.fetchPreparedData = (callback) => {
      anonymousAction.getAnonymousExportFeaturePool(data => callback({
        featureOptions: data
      }));
    };

    // execute
    this.fetchPreparedData(data => {
      this.setState(assign({
        isLoaded: true,
      }, data));
    });
  };

  ComponentContent() {
    switch (this.state.step) {
      case STEPS.step1:
        return <AnonymousAnalysisCriteriaTag ref={this.storeCurrentStepComponent}
                                              criteria={this.state.criteria.get(STEPS.step1)}
                                              params={this.params}
                                              step={STEPS.step1}
                                              // stepPrev={this.stepTo(STEPS.step3)}
                                              stepNext={this.stepTo(STEPS.step2)}/>;
      case STEPS.step2:
        return <AnonymousAnalysisCriteriaTrail ref={this.storeCurrentStepComponent}
                                                criteria={this.state.criteria.get(STEPS.step2)}
                                                params={this.params}
                                                step={STEPS.step2}
                                                stepPrev={this.stepTo(STEPS.step1)}
                                                stepNext={this.stepTo(STEPS.step3)}/>;
      case STEPS.step3:
        return <AnonymousAnalysisCriteriaOverview ref={this.storeCurrentStepComponent}
                                                  criteria={this.state.criteria}
                                                  params={this.params}
                                                  step={STEPS.step3}
                                                  STEPS={STEPS}
                                                  //stepPrev={this.stepTo(STEPS.step5)}
                                                  stepNext={this.stepTo(STEPS.step4)}/>;
      case STEPS.step4:
        return (
          <Loader loaded={this.state.isLoaded}>
            <AnonymousAnalysisOutputFeaturePicker ref={this.storeCurrentStepComponent}
                                             criteria={this.state.criteria}
                                             output={this.state.output}
                                             featureOptions={this.state.featureOptions}
                                             params={this.params}
                                             step={STEPS.step4}/>
          </Loader>
        );

    }
  };

  ComponentSideBar() {
    return <AnonymousAnalysisNavigator stepTo={this.stepToHandler()}/>
  };
};


class AnonymousAnalysisNavigator extends React.PureComponent {
  componentWillMount() {
    this.stepToHandler = (step) => {
      return (() => {
        this.props.stepTo(step);
      });
    };
  };

  render() {
    return (
      <div className="table_block table-responsive">
        <h2>設定觀察客群</h2>
        <ul className="step">
          <li><a href="javascript:;" onClick={this.stepToHandler(STEPS.step1)}>第一步：標籤篩選</a></li>
          <li><a href="javascript:;" onClick={this.stepToHandler(STEPS.step2)}>第二步：線上足跡</a></li>
          <li><a href="javascript:;" onClick={this.stepToHandler(STEPS.step3)}>第三步：條件總覽</a></li>
          <li><a href="javascript:;" onClick={this.stepToHandler(STEPS.step4)}>第四步：挑選下載欄位</a></li>
        </ul>
      </div>
    );
  }
};