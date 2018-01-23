import React  from 'react';
import BodyLayout from "./BodyLayout";
import {Map} from 'immutable';
import IntegratedAnalysisCriteriaClient from './IntegratedAnalysisCriteriaClient';
import IntegratedAnalysisCriteriaVehicle from "./IntegratedAnalysisCriteriaVehicle";
import IntegratedAnalysisCriteriaTransaction from "./IntegratedAnalysisCriteriaTransaction";
import IntegratedAnalysisCriteriaTag from "./IntegratedAnalysisCriteriaTag";
import IntegratedAnalysisCriteriaTrail from "./IntegratedAnalysisCriteriaTrail";
import IntegratedAnalysisCriteriaPreview from "./IntegratedAnalysisCriteriaPreview";
import IntegratedAnalysisFeaturePicker from "./IntegratedAnalysisFeaturePicker";

const STEP = Object.freeze({
  step1: 'client',
  step2: 'vehicle',
  step3: 'transaction',
  step4: 'tag',
  step5: 'trail',
  step6: 'step6',
  step7: 'step7'
});

export default class IntegratedAnalysisHome extends BodyLayout {
  constructor(props) {
    super(props);
    this.state = {
      step: STEP.step1,
      criteria: Map({
        [STEP.step1]: [],
        [STEP.step2]: [],
        [STEP.step3]: [],
        [STEP.step4]: [],
        [STEP.step5]: []
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

      let isReady = this.stepComponent.isReadyToLeave();
      console.log('IntegratedAnalysisHome::isReady: ', isReady);

      if (isReady) {
        let criteria = this.stepComponent.criteriaGathering();
        console.log('IntegratedAnalysisHome::criteria: ' , criteria);
        this.setState(prevState => {
          return {
            step: targetStep,
            criteria: prevState.criteria.set(prevState.step, criteria)
          };
        });
      } else {
        window.alert('Please confirm your criteria before leaving.');
      }
    };

    this.stepToHandler = (targetStep) => {

      return () => {
        this.stepTo(targetStep);
      };
    };

    this.storeCurrentStepComponent = (e) => {
      this.stepComponent = e;
    };
  };

  ContentComponent() {
    switch (this.state.step) {
      case STEP.step1:
        return <IntegratedAnalysisCriteriaClient ref={this.storeCurrentStepComponent}
                                                 params={this.params}
                                                 step={STEP.step1}
                                                 stepNext={this.stepToHandler(STEP.step2)}/>;
      case STEP.step2:
        return <IntegratedAnalysisCriteriaVehicle ref={this.storeCurrentStepComponent}
                                                  params={this.params}
                                                  step={STEP.step2}
                                                  stepPrev={this.stepToHandler(STEP.step1)}
                                                  stepNext={this.stepToHandler(STEP.step3)}/>;
      case STEP.step3:
        return <IntegratedAnalysisCriteriaTransaction ref={this.storeCurrentStepComponent}
                                                      params={this.params}
                                                      step={STEP.step3}
                                                      stepPrev={this.stepToHandler(STEP.step2)}
                                                      stepNext={this.stepToHandler(STEP.step4)}/>;
      case STEP.step4:
        return <IntegratedAnalysisCriteriaTag ref={this.storeCurrentStepComponent}
                                              params={this.params}
                                              step={STEP.step4}
                                              stepPrev={this.stepToHandler(STEP.step3)}
                                              stepNext={this.stepToHandler(STEP.step5)}/>;
      case STEP.step5:
        return <IntegratedAnalysisCriteriaTrail ref={this.storeCurrentStepComponent}
                                                params={this.params}
                                                step={STEP.step5}
                                                stepPrev={this.stepToHandler(STEP.step4)}
                                                stepNext={this.stepToHandler(STEP.step6)}/>;
      case STEP.step6:
        return <IntegratedAnalysisCriteriaPreview ref={this.storeCurrentStepComponent}
                                                  params={this.params}
                                                  step={STEP.step6}
                                                  stepPrev={this.stepToHandler(STEP.step5)}
                                                  stepNext={this.stepToHandler(STEP.step7)}/>;
      case STEP.step7:
        return <IntegratedAnalysisFeaturePicker ref={this.storeCurrentStepComponent}
                                                params={this.params}
                                                step={STEP.step7}
                                                stepPrev={this.stepToHandler(STEP.step6)}/>;

    }
  };

  SideBarComponent() {
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
          <li><a href="#" onClick={this.stepToHandler(STEP.step1)}>第一步：顧客屬性資料</a></li>
          <li><a href="#" onClick={this.stepToHandler(STEP.step2)}>第二步：車輛屬性資料</a></li>
          <li><a href="#" onClick={this.stepToHandler(STEP.step3)}>第三步：明細資料指定條件</a></li>
          <li><a href="#" onClick={this.stepToHandler(STEP.step4)}>第四步：標籤</a></li>
          <li><a href="#" onClick={this.stepToHandler(STEP.step4)}>第五步：行為軌跡</a></li>
          <li><a href="#" onClick={this.stepToHandler(STEP.step4)}>第六步：條件總覽</a></li>
        </ul>
      </div>
    );
  }
};