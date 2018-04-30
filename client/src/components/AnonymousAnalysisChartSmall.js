import IntegratedAnalysisChartSmall from "./IntegratedAnalysisChartSmall";

export default class AnonymousAnalysisChartSmall extends IntegratedAnalysisChartSmall {
  changeView() {
    window.location.href = `/integration/${this.mode}/query/${this.queryId}/analysis/large`;
  };
}