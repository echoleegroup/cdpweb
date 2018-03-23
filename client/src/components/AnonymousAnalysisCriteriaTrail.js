import IntegratedAnalysisCriteriaTrail from './IntegratedAnalysisCriteriaTrail';
import AnonymousAnalysisAction from "../actions/anonymous-analysis-action";
import IntegratedAnalysisAction from "../actions/integrated-analysis-action";

export default class AnonymousAnalysisCriteriaTrail extends IntegratedAnalysisCriteriaTrail {
  fetchPreparedData(props, _this, callback) {
    // console.log('TAG fetchPreparedData');
    AnonymousAnalysisAction.getAnonymousTrailFeatureSets(data => {
      callback({
        featureSets: data
      });
    });
  };

  subheadText() {
    return '第二步 挑選標籤篩選資料';
  };
}