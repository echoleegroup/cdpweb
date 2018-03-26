import React from 'react';
import Loader from 'react-loader';
import BodyLayout from "./BodyLayout";
import {List, Map} from 'immutable';
import {assign} from 'lodash';
import IntegratedAnalysisCriteriaClient from './IntegratedAnalysisCriteriaClient';
import IntegratedAnalysisCriteriaVehicle from "./IntegratedAnalysisCriteriaVehicle";
import IntegratedAnalysisCriteriaTransaction from "./IntegratedAnalysisCriteriaTransaction";
import IntegratedAnalysisCriteriaTag from "./IntegratedAnalysisCriteriaTag";
import IntegratedAnalysisCriteriaTrail from "./IntegratedAnalysisCriteriaTrail";
import IntegratedAnalysisCriteriaOverview from "./IntegratedAnalysisCriteriaOverview";
import IntegratedAnalysisFeaturePicker from "./IntegratedAnalysisOutputFeaturePicker";
import integratedAction from '../actions/integrated-analysis-action';
import {getDate} from '../utils/date-util';

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
  step1: 'client',
  step2: 'vehicle',
  step3: 'transaction',
  step4: 'tag',
  step5: 'trail',
  step6: '_preview',
  step7: '_features'
};

const STEP_FORWARD_HANDLERS = Object.freeze({
  [STEPS.step1]: criteriaStepForwardHandler,
  [STEPS.step2]: criteriaStepForwardHandler,
  [STEPS.step3]: criteriaStepForwardHandler,
  [STEPS.step4]: criteriaStepForwardHandler,
  [STEPS.step5]: criteriaStepForwardHandler,
  [STEPS.step6]: stepForwardHandler,
  [STEPS.step7]: featurePickerStepForwardHandler,
});

export default class IntegratedAnalysisHome extends BodyLayout {
  constructor(props) {
    super(props);

    let today = getDate();

    this.state = {
      isLoaded:false,
      step: STEPS.step1,
      featureOptions: [],
      relativeSetOptions: [],
      criteria: Map({
        [STEPS.step1]: [],
        [STEPS.step2]: [],
        [STEPS.step3]: [],
        [STEPS.step4]: [],
        [STEPS.step5]: []
      }),
      output: {
        selectedFeature: List(),
        selectedRelative: List(),
        periodStart: today.value,
        periodStartLabel: today.value_label,
        periodEnd: today.value,
        periodEndLabel: today.value_label,
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

    this.fetchExportFeatureOptions = (callback) => {
      integratedAction.getExportFeaturePool(callback);
    };

    this.fetchPreparedData = (callback) => {
      this.fetchExportFeatureOptions(data => callback({
        featureOptions: data.featureOptions,
        relativeSetOptions: data.relativeSetOptions
      }));
    };

    // execute
    this.fetchPreparedData(data => {
      this.setState(assign({
        isLoaded: true,
      }, data));
    });
  };
  //
  // componentWillUpdate(nextProps, nextState) {
  //   console.log('IntegratedAnalysisHome::componentWillUpdate this.props: ', this.props);
  //   console.log('IntegratedAnalysisHome::componentWillUpdate nextProps: ', nextProps);
  //   console.log('IntegratedAnalysisHome::componentWillUpdate this.state: ', this.state);
  //   console.log('IntegratedAnalysisHome::componentWillUpdate nextState: ', nextState);
  // };

  ComponentContent() {
    switch (this.state.step) {
      case STEPS.step1:
        return <IntegratedAnalysisCriteriaClient ref={this.storeCurrentStepComponent}
                                                 criteria={this.state.criteria.get(STEPS.step1)}
                                                 params={this.params}
                                                 step={STEPS.step1}
                                                 stepNext={this.stepTo(STEPS.step2)}/>;
      case STEPS.step2:
        return <IntegratedAnalysisCriteriaVehicle ref={this.storeCurrentStepComponent}
                                                  criteria={this.state.criteria.get(STEPS.step2)}
                                                  params={this.params}
                                                  step={STEPS.step2}
                                                  stepPrev={this.stepTo(STEPS.step1)}
                                                  stepNext={this.stepTo(STEPS.step3)}/>;
      case STEPS.step3:
        return <IntegratedAnalysisCriteriaTransaction ref={this.storeCurrentStepComponent}
                                                      criteria={this.state.criteria.get(STEPS.step3)}
                                                      params={this.params}
                                                      step={STEPS.step3}
                                                      stepPrev={this.stepTo(STEPS.step2)}
                                                      stepNext={this.stepTo(STEPS.step4)}/>;
      case STEPS.step4:
        return <IntegratedAnalysisCriteriaTag ref={this.storeCurrentStepComponent}
                                              criteria={this.state.criteria.get(STEPS.step4)}
                                              params={this.params}
                                              step={STEPS.step4}
                                              stepPrev={this.stepTo(STEPS.step3)}
                                              stepNext={this.stepTo(STEPS.step6)}/>;
      case STEPS.step5:
        return <IntegratedAnalysisCriteriaTrail ref={this.storeCurrentStepComponent}
                                                criteria={this.state.criteria.get(STEPS.step5)}
                                                params={this.params}
                                                step={STEPS.step5}
                                                stepPrev={this.stepTo(STEPS.step4)}
                                                stepNext={this.stepTo(STEPS.step6)}/>;
      case STEPS.step6:
        return <IntegratedAnalysisCriteriaOverview ref={this.storeCurrentStepComponent}
                                                  criteria={this.state.criteria}
                                                  params={this.params}
                                                  step={STEPS.step6}
                                                  STEPS={STEPS}
                                                  //stepPrev={this.stepTo(STEPS.step5)}
                                                  stepNext={this.stepTo(STEPS.step7)}/>;
      case STEPS.step7:
        return (
          <Loader loaded={this.state.isLoaded}>
            <IntegratedAnalysisFeaturePicker ref={this.storeCurrentStepComponent}
                                             criteria={this.state.criteria}
                                             output={this.state.output}
                                             featureOptions={this.state.featureOptions}
                                             relativeSetOptions={this.state.relativeSetOptions}
                                             params={this.params}
                                             step={STEPS.step7}/>
          </Loader>
        );

    }
  };

  ComponentSideBar() {
    return <IntegratedAnalysisNavigator stepTo={this.stepToHandler()}/>
  };
};


class IntegratedAnalysisNavigator extends React.PureComponent {
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
          <li><a href="javascript:;" onClick={this.stepToHandler(STEPS.step1)}>第一步：顧客屬性資料</a></li>
          <li><a href="javascript:;" onClick={this.stepToHandler(STEPS.step2)}>第二步：車輛屬性資料</a></li>
          <li><a href="javascript:;" onClick={this.stepToHandler(STEPS.step3)}>第三步：明細資料指定條件</a></li>
          <li><a href="javascript:;" onClick={this.stepToHandler(STEPS.step4)}>第四步：標籤篩選</a></li>
          <li><a href="javascript:;" onClick={this.stepToHandler(STEPS.step5)}>第五步：線上足跡</a></li>
          <li><a href="javascript:;" onClick={this.stepToHandler(STEPS.step6)}>第六步：條件總覽</a></li>
          <li><a href="javascript:;" onClick={this.stepToHandler(STEPS.step7)}>第七步：挑選下載欄位</a></li>
        </ul>
      </div>
    );
  }
};