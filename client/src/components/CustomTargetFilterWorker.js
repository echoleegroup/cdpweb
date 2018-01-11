import React from 'react';
import CustomTargetFilterCriteria from './CustomTargetFilterCriteria';

export default class CustomTargetFilterWorker extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      criteria: {
        isIncludeModelTarget: true,
        expression: []
      },
      prediction: {
        size: 0,
        model_target: 0
      }
    };
  };

  componentWillMount() {
    this.setIncludeModelTarget = () => {
      this.setState(prevState => ({isIncludeModelTarget: true}));
    };

    this.setExcludeModelTarget = () => {
      this.setState(prevState => ({isIncludeModelTarget: false}));
    };

    this.getCriteria = () => {
      return {
        isIncludeModelTarget: this.state.isIncludeModelTarget,
        expression: this.criteriaComp.getCriteria()
      };
    };

    this.filterResultPreview = () => {
      let criteria = this.getCriteria();
      console.log('PreferredTargetAction::filterResultPreview: ', criteria);
    };

    this.doFiltering = () => {};
  };

  componentWillUpdate() {
    console.log('PreferredTargetAction::componentWillUpdate');
  };

  render() {
    return (
      <div>
        {/*<!-- table set Start -->*/}
        <div className="table_block">
          <h2>自定名單試算與下載</h2>
          <form className="form-horizontal">
            <div className="form-group">
              <label htmlFor="inputName" className="col-sm-3 control-label">是否包含模型受眾</label>
              <div className="col-sm-8">
                <label className="radio-inline">
                  <input type="radio" name="optradio" value={true} defaultChecked={this.state.isIncludeModelTarget} onClick={this.setIncludeModelTarget}/>是</label>
                <label className="radio-inline">
                  <input type="radio" name="optradio" value={false} onClick={this.setExcludeModelTarget}/>否</label>
              </div>
            </div>
            <CustomTargetFilterPreview prediction={this.state.prediction}/>
          </form>
          <div className="btn-block center-block">
            <button type="submit" className="btn btn-lg btn-default" onClick={this.filterResultPreview}>名單數試算</button>
            <button type="submit" className="btn btn-lg btn-default" onClick={this.doFiltering}>自定名單下載</button>
          </div>
        </div>
        <CustomTargetFilterCriteria params={this.props.params} ref={(e) => {
          this.criteriaComp = e;
        }}/>
      </div>
    );
  };
}

class CustomTargetFilterPreview extends React.PureComponent {
  constructor(props) {
    super();
    this.state = {
      total_target_count: props.total_target_count,
      model_target_count: props.model_target_count
    };
  };

  render() {
    return (
      <div className="form-group">
        <label htmlFor="inputName" className="col-sm-3 control-label">名單數試算
        </label>
        <div className="col-sm-8">
          <div className="form-inline">
            <span className="count">{this.props.prediction.size}</span>
            <small>(含模型受眾 {this.props.prediction.model_target})</small>
          </div>
        </div>
      </div>
    );
  };
}