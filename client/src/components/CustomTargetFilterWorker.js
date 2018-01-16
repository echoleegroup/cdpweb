import React from 'react';
import Loader from 'react-loader';
import numeral from 'numeral';
import CustomTargetFilterCriteria from './CustomTargetFilterCriteria';
import CriteriaAction from '../actions/criteria-action';

export default class CustomTargetFilterWorker extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      isLoaded: true,
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
    this.setIncludeModelTarget = (e) => {
      this.setState({
        isIncludeModelTarget: e.target.value
      });
    };

    this.setExcludeModelTarget = (e) => {
      this.setState({
        isIncludeModelTarget: e.target.value
      });
    };

    this.getCriteria = () => {
      return {
        isIncludeModelTarget: this.state.criteria.isIncludeModelTarget,
        statements: this.criteriaComp.getCriteria()
      };
    };

    this.filterResultPreview = () => {
      this.setState({
        isLoaded: false
      });

      let postData = this.getCriteria();
      console.log('CustomTargetFilterWorker::filterResultPreview: ', postData);
      CriteriaAction.getCustomTargetFilterPreview(this.props.params.mdId, this.props.params.batId, postData, data => {
        this.setState({
          isLoaded: true,
          prediction: {
            sizeOfResults: data.size,
            sizeOfResultsInTarget: data.sizeOfResultsInTarget
          }
        });
      });
    };

    this.filterResultExport = () => {
      this.setState({
        isLoaded: false
      });

      let postData = this.getCriteria();
      // console.log('CustomTargetFilterWorker::filterResultExport: ', postData);
      CriteriaAction.getCustomTargetFilterExport(this.props.params.mdId, this.props.params.batId, postData, data => {
        this.setState({
          isLoaded: true
        });
      });
    };

    this.getHistory = () => {
      this.setState({
        isLoaded: false
      });

      CriteriaAction.getCriteriaHistory(this.props.params.mdId, this.props.params.batId, data => {
        // console.log('getCriteriaHistory: ', data);
        this.setState(prevState => ({
          isLoaded: true,
          criteria: {
            isIncludeModelTarget: prevState.criteria.isIncludeModelTarget,
            expression: data
          }
        }));
      })
    };

    this.getHistory();
  };

  componentWillUpdate() {
    console.log('CustomTargetFilterWorker::componentWillUpdate');
  };

  render() {
    return (
      <Loader loaded={this.state.isLoaded}>
        {/*<!-- table set Start -->*/}
        <div className="table_block">
          <h2>自定名單試算與下載</h2>
          <form className="form-horizontal">
            <div className="form-group">
              <label htmlFor="inputName" className="col-sm-3 control-label">是否包含模型受眾</label>
              <div className="col-sm-8">
                <label className="radio-inline">
                  <input type="radio" name="optradio" value={true} defaultChecked={this.state.criteria.isIncludeModelTarget} onChange={this.setIncludeModelTarget}/>是</label>
                <label className="radio-inline">
                  <input type="radio" name="optradio" value={false} defaultChecked={!this.state.criteria.isIncludeModelTarget} onChange={this.setExcludeModelTarget}/>否</label>
              </div>
            </div>
            <CustomTargetFilterPreview prediction={this.state.prediction}/>
          </form>
          <div className="btn-block center-block">
            <button type="submit" className="btn btn-lg btn-default" onClick={this.filterResultPreview}>名單數試算</button>
            <button type="submit" className="btn btn-lg btn-default" onClick={this.filterResultExport}>自定名單下載</button>
          </div>
        </div>
        <CustomTargetFilterCriteria params={this.props.params} criteria={this.state.criteria.expression} ref={(e) => {
          this.criteriaComp = e;
        }}/>
      </Loader>
    );
  };
}

class CustomTargetFilterPreview extends React.PureComponent {
  render() {
    return (
      <div className="form-group">
        <label htmlFor="inputName" className="col-sm-3 control-label">名單數試算
        </label>
        <div className="col-sm-8">
          <div className="form-inline">
            <span className="count">{numeral(this.props.prediction.sizeOfResults).format('0,0')}</span>
            <small>(含模型受眾 {numeral(this.props.prediction.sizeOfResultsInTarget).format('0,0')})</small>
          </div>
        </div>
      </div>
    );
  };
}