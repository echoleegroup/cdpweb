import IntegratedAnalysisCriteriaTag from './IntegratedCriteriaTag';
import AnonymousAnalysisAction from "../actions/anonymous-analysis-action";

export default class AnonymousCriteriaTag extends IntegratedAnalysisCriteriaTag {
  fetchPreparedData(props, _this, callback) {
    // console.log('TAG fetchPreparedData');
    AnonymousAnalysisAction.getAnonymousTagFeatureSets(data => {
      callback({
        featureSets: data
      });
    });
  };

  subheadText() {
    return '第一步 挑選標籤篩選資料';
  };
}