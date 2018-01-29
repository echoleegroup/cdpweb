import React  from 'react';
import BodyLayout from "./BodyLayout";
import {OrderedMap} from 'immutable';
import IntegratedAnalysisCriteriaClient from './IntegratedAnalysisCriteriaClient';
import IntegratedAnalysisCriteriaVehicle from "./IntegratedAnalysisCriteriaVehicle";
import IntegratedAnalysisCriteriaTransaction from "./IntegratedAnalysisCriteriaTransaction";
import IntegratedAnalysisCriteriaTag from "./IntegratedAnalysisCriteriaTag";
import IntegratedAnalysisCriteriaTrail from "./IntegratedAnalysisCriteriaTrail";
import IntegratedAnalysisCriteriaPreview from "./IntegratedAnalysisCriteriaPreview";
import IntegratedAnalysisFeaturePicker from "./IntegratedAnalysisOutputFeaturePicker";

const criteriaStepForwardHandler = (targetStep, _that) => {
  console.log('criteriaStepForwardHandler: ', _that.state.step);
  let isReady = _that.stepComponent.isReadyToLeave();
  console.log('IntegratedAnalysisHome::isReady: ', isReady);

  if (isReady) {
    let criteria = _that.stepComponent.getCriteria();
    console.log('IntegratedAnalysisHome::criteria: ' , criteria);
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
  [STEPS.step7]: stepForwardHandler,
});

export default class IntegratedAnalysisHome extends BodyLayout {
  constructor(props) {
    super(props);
    this.state = {
      step: STEPS.step1,
      criteria: OrderedMap({
        [STEPS.step1]: [],
        [STEPS.step2]: [],
        [STEPS.step3]: [],
        [STEPS.step4]: [],
        [STEPS.step5]: []
      })
    };
  };

  componentWillMount() {

    this.setStep = (targetStep) => {
      console.log('IntegratedAnalysisHome::stepTo: ' , targetStep);

      this.setState({
        step: targetStep
      });
    };

    this.stepTo = (targetStep) => {
      return () => {
        this.setStep(targetStep);
      };
    };

    this.stepToHandler = () => {
      return (targetStep) => {
        this.setStep(targetStep);
      };
    };

    this.storeCurrentStepComponent = (e) => {
      this.stepComponent = e;
    };
  };

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
                                              stepNext={this.stepTo(STEPS.step5)}/>;
      case STEPS.step5:
        return <IntegratedAnalysisCriteriaTrail ref={this.storeCurrentStepComponent}
                                                criteria={this.state.criteria.get(STEPS.step5)}
                                                params={this.params}
                                                step={STEPS.step5}
                                                stepPrev={this.stepTo(STEPS.step4)}
                                                stepNext={this.stepTo(STEPS.step6)}/>;
      case STEPS.step6:
        return <IntegratedAnalysisCriteriaPreview ref={this.storeCurrentStepComponent}
                                                  criteria={this.state.criteria}
                                                  params={this.params}
                                                  step={STEPS.step6}
                                                  STEPS={STEPS}
                                                  //stepPrev={this.stepTo(STEPS.step5)}
                                                  stepNext={this.stepTo(STEPS.step7)}/>;
      case STEPS.step7:
        return <IntegratedAnalysisFeaturePicker ref={this.storeCurrentStepComponent}
                                                params={this.params}
                                                step={STEPS.step7}/>;

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
          <li><a href="#" onClick={this.stepToHandler(STEPS.step1)}>第一步：顧客屬性資料</a></li>
          <li><a href="#" onClick={this.stepToHandler(STEPS.step2)}>第二步：車輛屬性資料</a></li>
          <li><a href="#" onClick={this.stepToHandler(STEPS.step3)}>第三步：明細資料指定條件</a></li>
          <li><a href="#" onClick={this.stepToHandler(STEPS.step4)}>第四步：標籤</a></li>
          <li><a href="#" onClick={this.stepToHandler(STEPS.step5)}>第五步：行為軌跡</a></li>
          <li><a href="#" onClick={this.stepToHandler(STEPS.step6)}>第六步：條件總覽</a></li>
        </ul>
      </div>
    );
  }
};