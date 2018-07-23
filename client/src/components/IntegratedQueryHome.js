import React from 'react';
import CriteriaHomeLayout from "./CriteriaHomeLayout";
import {List} from 'immutable';
import {assign} from 'lodash';
import IntegratedCriteriaClient from './IntegratedCriteriaClient';
import IntegratedCriteriaVehicle from "./IntegratedCriteriaVehicle";
import IntegratedCriteriaTransaction from "./IntegratedCriteriaTransaction";
import IntegratedCriteriaTag from "./IntegratedCriteriaTag";
import IntegratedCriteriaTrail from "./IntegratedCriteriaTrail";
import IntegratedCriteriaOverview from "./IntegratedCriteriaOverview";
import IntegratedCriteriaExportFeaturePicker from "./IntegratedCriteriaExportFeaturePicker";
import {getExportFeaturePool} from '../actions/integrated-analysis-action';
import {getDate} from '../utils/date-util';

export default class IntegratedQueryHome extends CriteriaHomeLayout {
  constructor(props) {
    super(props);

    let today = getDate();

    this.state = assign({}, this.state, {
      relativeSetOptions: [],
      output: assign({}, this.state.output, {
        selectedRelative: List(),
        periodStart: today.value,
        periodStartLabel: today.value_label,
        periodEnd: today.value,
        periodEndLabel: today.value_label,
      })
    });
  };

  getDefaultStepCriteria(steps) {
    return {
      [steps.step1]: [],
      [steps.step2]: [],
      [steps.step3]: [],
      [steps.step4]: [],
      [steps.step5]: []
    };
  };

  getStepMapper() {
    return Object.freeze({
      step1: 'client',
      step2: 'vehicle',
      step3: 'transaction',
      step4: 'tag',
      step5: 'trail',
      step6: '_preview',
      step7: '_features'
    });
  };

  stepForward(step, targetStep) {
    if (targetStep === step)
      return;

    switch (step) {
      case this.STEPS.step1:
      case this.STEPS.step2:
      case this.STEPS.step3:
      case this.STEPS.step4:
      case this.STEPS.step5:
        return this.criteriaStepForwardHandler(targetStep);
      case this.STEPS.step6:
        return this.stepForwardHandler(targetStep);
      case this.STEPS.step7:
        return this.featurePickerStepForwardHandler(targetStep);
      default:
        return this.stepForwardHandler(targetStep);
    }
  };

  fetchPreparedData(callback) {
    getExportFeaturePool(data => callback({
      featureOptions: data.featureOptions,
      relativeSetOptions: data.relativeSetOptions
    }));
  };

  ComponentContent(props) {
    let STEPS = this.STEPS;
    switch (this.state.step) {
      case STEPS.step1:
        return <IntegratedCriteriaClient ref={this.storeCurrentStepComponent}
                                         criteria={this.state.criteria.get(STEPS.step1)}
                                         params={this.params}
                                         changeViewHandler={this.changeViewHandler}
                                         step={STEPS.step1}
                                         stepNext={this.stepTo(STEPS.step2)}/>;
      case STEPS.step2:
        return <IntegratedCriteriaVehicle ref={this.storeCurrentStepComponent}
                                          criteria={this.state.criteria.get(STEPS.step2)}
                                          params={this.params}
                                          changeViewHandler={this.changeViewHandler}
                                          step={STEPS.step2}
                                          stepPrev={this.stepTo(STEPS.step1)}
                                          stepNext={this.stepTo(STEPS.step3)}/>;
      case STEPS.step3:
        return <IntegratedCriteriaTransaction ref={this.storeCurrentStepComponent}
                                              criteria={this.state.criteria.get(STEPS.step3)}
                                              params={this.params}
                                              changeViewHandler={this.changeViewHandler}
                                              step={STEPS.step3}
                                              stepPrev={this.stepTo(STEPS.step2)}
                                              stepNext={this.stepTo(STEPS.step4)}/>;
      case STEPS.step4:
        return <IntegratedCriteriaTag ref={this.storeCurrentStepComponent}
                                      criteria={this.state.criteria.get(STEPS.step4)}
                                      params={this.params}
                                      changeViewHandler={this.changeViewHandler}
                                      step={STEPS.step4}
                                      stepPrev={this.stepTo(STEPS.step3)}
                                      stepNext={this.stepTo(STEPS.step5)}/>;
      case STEPS.step5:
        return <IntegratedCriteriaTrail ref={this.storeCurrentStepComponent}
                                        criteria={this.state.criteria.get(STEPS.step5)}
                                        params={this.params}
                                        changeViewHandler={this.changeViewHandler}
                                        step={STEPS.step5}
                                        stepPrev={this.stepTo(STEPS.step4)}
                                        stepNext={this.stepTo(STEPS.step6)}/>;
      case STEPS.step6:
        return <IntegratedCriteriaOverview ref={this.storeCurrentStepComponent}
                                           criteria={this.state.criteria}
                                           params={this.params}
                                           step={STEPS.step6}
                                           STEPS={STEPS}
                                                  //stepPrev={this.stepTo(STEPS.step5)}
                                           stepNext={this.stepTo(STEPS.step7)}/>;
      case STEPS.step7:
        return (
          <IntegratedCriteriaExportFeaturePicker ref={this.storeCurrentStepComponent}
                                                 criteria={this.state.criteria}
                                                 output={this.state.output}
                                                 featureOptions={this.state.featureOptions}
                                                 relativeSetOptions={this.state.relativeSetOptions}
                                                 params={this.params}
                                                 step={STEPS.step7}
                                                 pageLoading={this.pageLoading}
                                                 pageUnloading={this.pageUnloading}/>
        );

    }
  };

  ComponentSideBar(props) {
    return <IntegratedAnalysisNavigator STEPS={this.STEPS}
                                        stepTo={this.stepToHandler}/>
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
    let STEPS = this.props.STEPS;
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