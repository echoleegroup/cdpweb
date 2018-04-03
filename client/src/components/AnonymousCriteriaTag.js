import IntegratedAnalysisCriteriaTag from './IntegratedCriteriaTag';
import {getAnonymousTagFeatureSets} from "../actions/anonymous-analysis-action";

export default class AnonymousCriteriaTag extends IntegratedAnalysisCriteriaTag {
  fetchPreparedData(callback) {
    // console.log('TAG fetchPreparedData');
    getAnonymousTagFeatureSets(data => {
      callback({
        featureSets: data
      });
    });
  };

  subheadText() {
    return '第一步 挑選標籤篩選資料';
  };
}