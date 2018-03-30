import IntegratedAnalysisCriteriaTrail from './IntegratedCriteriaTrail';
import anonymousAnalysisAction from "../actions/anonymous-analysis-action";

export default class AnonymousCriteriaTrail extends IntegratedAnalysisCriteriaTrail {
  fetchPreparedData(callback) {
    // console.log('TAG fetchPreparedData');
    anonymousAnalysisAction.getAnonymousTrailFeatureSets(data => {
      callback({
        featureSets: data
      });
    });
  };

  subheadText() {
    return '第二步 挑選顧客行為軌跡指定條件';
  };
}