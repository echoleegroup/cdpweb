import React from 'react';
import PreferredTargetCriteria from './PreferredTargetCriteria';

export default class PreferredTargetAction extends React.Component {
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
                  <input type="radio" name="optradio" defaultChecked={true}/>是</label>
                <label className="radio-inline">
                  <input type="radio" name="optradio"/>否</label>
              </div>
            </div>
            <PreferredTargetCount />
          </form>
          <div className="btn-block center-block">
            <button type="submit" className="btn btn-lg btn-default">名單數試算</button>
            <button type="submit" className="btn btn-lg btn-default">自定名單下載</button>
          </div>
        </div>
        <PreferredTargetCriteria/>
      </div>
    );
  };
}

class PreferredTargetCount extends React.PureComponent {
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
            <span className="count">3,602</span>
            <small>(含模型受眾 243)</small>
          </div>
        </div>
      </div>
    );
  };

  updateData(totalCount, modelCount) {
    this.setState({
      total_target_count: totalCount,
      model_target_count: modelCount
    });
  };
}