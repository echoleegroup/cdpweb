import React  from 'react';
import BodyLayout from "./BodyLayout";
import IntegratedAnalysisCriteriaClient from './IntegratedAnalysisCriteriaClient';
import IntegratedAnalysisCriteriaVehicle from "./IntegratedAnalysisCriteriaVehicle";
import IntegratedAnalysisCriteriaTransaction from "./IntegratedAnalysisCriteriaTransaction";
import IntegratedAnalysisCriteriaTag from "./IntegratedAnalysisCriteriaTag";
import IntegratedAnalysisCriteriaTrail from "./IntegratedAnalysisCriteriaTrail";
import IntegratedAnalysisCriteriaPreview from "./IntegratedAnalysisCriteriaPreview";
import IntegratedAnalysisFeaturePicker from "./IntegratedAnalysisFeaturePicker";

const STEP = Object.freeze({
  step1: 'step1',
  step2: 'step2',
  step3: 'step3',
  step4: 'step4',
  step5: 'step5',
  step6: 'step6',
  step7: 'step7'
});

export default class IntegratedAnalysisHome extends BodyLayout {
  constructor(props) {
    super(props);
    this.state = {
      step: STEP.step1
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
    this.setStep = (step) => {
      this.setState({
        step: step
      })
    };

    this.stepTo = (targetStep) => {
      return () => {
        this.setStep(targetStep);
      };
    };
  };

  ContentComponent() {
    switch (this.state.step) {
      case STEP.step1:
        return <IntegratedAnalysisCriteriaClient params={this.params}
                                                 step={STEP.step1}
                                                 stepNext={this.stepTo(STEP.step2)}/>;
      case STEP.step2:
        return <IntegratedAnalysisCriteriaVehicle params={this.params}
                                                  step={STEP.step2}
                                                  stepPrev={this.stepTo(STEP.step1)}
                                                  stepNext={this.stepTo(STEP.step3)}/>;
      case STEP.step3:
        return <IntegratedAnalysisCriteriaTransaction params={this.params}
                                                      step={STEP.step3}
                                                      stepPrev={this.stepTo(STEP.step2)}
                                                      stepNext={this.stepTo(STEP.step4)}/>;
      case STEP.step4:
        return <IntegratedAnalysisCriteriaTag params={this.params}
                                              step={STEP.step4}
                                              stepPrev={this.stepTo(STEP.step3)}
                                              stepNext={this.stepTo(STEP.step5)}/>;
      case STEP.step5:
        return <IntegratedAnalysisCriteriaTrail params={this.params}
                                                step={STEP.step5}
                                                stepPrev={this.stepTo(STEP.step4)}
                                                stepNext={this.stepTo(STEP.step6)}/>;
      case STEP.step6:
        return <IntegratedAnalysisCriteriaPreview params={this.params}
                                                  step={STEP.step6}
                                                  stepPrev={this.stepTo(STEP.step5)}
                                                  stepNext={this.stepTo(STEP.step7)}/>;
      case STEP.step7:
        return <IntegratedAnalysisFeaturePicker params={this.params}
                                                step={STEP.step7}
                                                stepPrev={this.stepTo(STEP.step6)}/>;

    }
  };

  SideBarComponent() {
    return <IntegratedAnalysisSideBar goToStep={this.setStep}/>
  };
};


class IntegratedAnalysisSideBar extends React.PureComponent {
  componentWillMount() {
    this.goToStep = (step) => {
      return (() => {
        this.props.goToStep(step);
      });
    };
  };

  render() {
    return (
      <div className="table_block table-responsive">
        <h2>設定觀察客群</h2>
        <ul className="step">
          <li><a href="#" onClick={this.goToStep(STEP.step1)}>第一步：顧客屬性資料</a></li>
          <li><a href="#" onClick={this.goToStep(STEP.step2)}>第二步：車輛屬性資料</a></li>
          <li><a href="#" onClick={this.goToStep(STEP.step3)}>第三步：明細資料指定條件</a></li>
          <li><a href="#" onClick={this.goToStep(STEP.step4)}>第四步：標籤</a></li>
          <li><a href="#" onClick={this.goToStep(STEP.step4)}>第五步：行為軌跡</a></li>
          <li><a href="#" onClick={this.goToStep(STEP.step4)}>第六步：條件總覽</a></li>
        </ul>
      </div>
    );
  }
};