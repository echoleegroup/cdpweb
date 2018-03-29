import React from 'react';
import Loader from 'react-loader';
import CriteriaHomeLayout from "./CriteriaHomeLayout";
import AnonymousAnalysisCriteriaTrail from "./AnonymousAnalysisCriteriaTrail";
import anonymousAction from '../actions/anonymous-analysis-action';
import AnonymousAnalysisCriteriaTag from "./AnonymousAnalysisCriteriaTag";
import AnonymousAnalysisCriteriaOverview from "./AnonymousAnalysisCriteriaOverview";
import AnonymousAnalysisOutputFeaturePicker from "./AnonymousAnalysisOutputFeaturePicker";

export default class AnonymousAnalysisHome extends CriteriaHomeLayout {
  constructor(props) {
    super(props);
  };

  getDefaultStepCriteria(steps) {
    return {
      [steps.step1]: [],
      [steps.step2]: []
    };
  };

  getStepMapper() {
    return Object.freeze({
      step1: 'tag',
      step2: 'trail',
      step3: '_preview',
      step4: '_features'
    });
  };

  getStepForwardHandler(step) {
    switch (step) {
      case this.STEPS.step1:
      case this.STEPS.step2:
        return this.criteriaStepForwardHandler;
      case this.STEPS.step3:
        return this.stepForwardHandler;
      case this.STEPS.step4:
        return this.featurePickerStepForwardHandler;
      default:
        return this.stepForwardHandler;
    }
  };

  fetchPreparedData(callback) {
    anonymousAction.getAnonymousExportFeaturePool(data => callback({
      featureOptions: data
    }));
  };

  ComponentContent(props) {
    let STEPS = this.STEPS;
    switch (this.state.step) {
      case STEPS.step1:
        return <AnonymousAnalysisCriteriaTag ref={this.storeCurrentStepComponent}
                                             criteria={this.state.criteria.get(STEPS.step1)}
                                             params={this.params}
                                             alertMessageAdaptor={this.alertMessageAdaptor}
                                             step={STEPS.step1}
                                             stepNext={this.stepTo(STEPS.step2)}/>;
      case STEPS.step2:
        return <AnonymousAnalysisCriteriaTrail ref={this.storeCurrentStepComponent}
                                               criteria={this.state.criteria.get(STEPS.step2)}
                                               params={this.params}
                                               alertMessageAdaptor={this.alertMessageAdaptor}
                                               step={STEPS.step2}
                                               stepPrev={this.stepTo(STEPS.step1)}
                                               stepNext={this.stepTo(STEPS.step3)}/>;
      case STEPS.step3:
        return <AnonymousAnalysisCriteriaOverview ref={this.storeCurrentStepComponent}
                                                  criteria={this.state.criteria}
                                                  params={this.params}
                                                  step={STEPS.step3}
                                                  STEPS={STEPS}
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

  ComponentSideBar(props) {
    return <AnonymousAnalysisNavigator STEPS={this.STEPS}
                                       stepTo={this.stepToHandler}/>
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
    let STEPS = this.props.STEPS;
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