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

const STEPS = Object.freeze({
  step1: 'client',
  step2: 'vehicle',
  step3: 'transaction',
  step4: 'tag',
  step5: 'trail',
  step6: 'preview',
  step7: 'feature'
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
    // this.state = {
    //   client_profile: {
    //     criteria: []
    //   },
    //   vehicle: {
    //     criteria:[]
    //   },
    //   transaction: {
    //     criteria: []
    //   }
    // };
  };

  componentWillMount() {

    this.stepTo = (targetStep) => {
      console.log('IntegratedAnalysisHome::stepTo: ' , targetStep);

      this.setState({
        step: targetStep
      });
    };

    this.stepToCriteriaHandler = (targetStep) => {
      return () => {
        let isReady = this.stepComponent.isReadyToLeave();
        console.log('IntegratedAnalysisHome::isReady: ', isReady);

        if (isReady) {
          let criteria = this.stepComponent.getCriteria();
          console.log('IntegratedAnalysisHome::criteria: ' , criteria);
          this.setState(prevState => {
            return {
              criteria: prevState.criteria.set(prevState.step, criteria)
            };
          });
          this.stepTo(targetStep);
        } else {
          window.alert('Please confirm your criteria before leaving.');
        }
      };
    };

    this.stepToHandler = (targetStep) => {
      return () => {
        this.stepTo(targetStep);
      };
    }

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
                                                 stepNext={this.stepToCriteriaHandler(STEPS.step2)}/>;
      case STEPS.step2:
        return <IntegratedAnalysisCriteriaVehicle ref={this.storeCurrentStepComponent}
                                                  criteria={this.state.criteria.get(STEPS.step2)}
                                                  params={this.params}
                                                  step={STEPS.step2}
                                                  stepPrev={this.stepToCriteriaHandler(STEPS.step1)}
                                                  stepNext={this.stepToCriteriaHandler(STEPS.step3)}/>;
      case STEPS.step3:
        return <IntegratedAnalysisCriteriaTransaction ref={this.storeCurrentStepComponent}
                                                      criteria={this.state.criteria.get(STEPS.step3)}
                                                      params={this.params}
                                                      step={STEPS.step3}
                                                      stepPrev={this.stepToCriteriaHandler(STEPS.step2)}
                                                      stepNext={this.stepToCriteriaHandler(STEPS.step4)}/>;
      case STEPS.step4:
        return <IntegratedAnalysisCriteriaTag ref={this.storeCurrentStepComponent}
                                              criteria={this.state.criteria.get(STEPS.step4)}
                                              params={this.params}
                                              step={STEPS.step4}
                                              stepPrev={this.stepToCriteriaHandler(STEPS.step3)}
                                              stepNext={this.stepToCriteriaHandler(STEPS.step5)}/>;
      case STEPS.step5:
        return <IntegratedAnalysisCriteriaTrail ref={this.storeCurrentStepComponent}
                                                criteria={this.state.criteria.get(STEPS.step5)}
                                                params={this.params}
                                                step={STEPS.step5}
                                                stepPrev={this.stepToCriteriaHandler(STEPS.step4)}
                                                stepNext={this.stepToCriteriaHandler(STEPS.step6)}/>;
      case STEPS.step6:
        return <IntegratedAnalysisCriteriaPreview ref={this.storeCurrentStepComponent}
                                                  criteria={this.state.criteria}
                                                  params={this.params}
                                                  step={STEPS.step6}
                                                  STEPS={STEPS}
                                                  stepPrev={this.stepToHandler(STEPS.step5)}
                                                  stepNext={this.stepToHandler(STEPS.step7)}/>;
      case STEPS.step7:
        return <IntegratedAnalysisFeaturePicker ref={this.storeCurrentStepComponent}
                                                params={this.params}
                                                step={STEPS.step7}
                                                stepPrev={this.stepToHandler(STEPS.step6)}/>;

    }
  };

  ComponentSideBar() {
    return <IntegratedAnalysisSideBar stepTo={this.stepTo}/>
  };
};


class IntegratedAnalysisSideBar extends React.PureComponent {
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