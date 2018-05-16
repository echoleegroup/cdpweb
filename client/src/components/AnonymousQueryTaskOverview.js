import IntegratedQueryTaskOverview from "./IntegratedQueryTaskOverview";

export default class AnonymousQueryTaskOverview extends IntegratedQueryTaskOverview {
  constructor(props) {
    super(props);
    this.recordLabel = '觀察線上用戶數';
  };
}