import React from 'react';
import Loader from 'react-loader';
import numeral from 'numeral';
import {format} from 'util';
import CustomTargetFilterCriteria from './CustomTargetFilterCriteria';
import CustomFilterAction from '../actions/custom-filter-action';

export default class CustomTargetFilterPrimaryContent extends React.PureComponent {
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

    this.criteriaGathering = () => {
      return {
        isIncludeModelTarget: this.state.criteria.isIncludeModelTarget,
        statements: this.criteriaComp.criteriaGathering()
      };
    };

    this.filterResultPreview = () => {
      let isReady = this.criteriaComp.isReadyToLeave();

      if (isReady) {
        let criteria = this.criteriaGathering();
        this.setState({
          //isLoaded: false,
          criteria
        });

        console.log('CustomTargetFilterWorker::filterResultPreview: ', criteria);
        CustomFilterAction.getCustomTargetFilterPreview(this.props.params.mdId, this.props.params.batId, criteria, data => {
          this.setState({
            isLoaded: true,
            prediction: {
              sizeOfResults: data.size,
              sizeOfResultsInTarget: data.sizeOfResultsInTarget
            }
          });
        });
      } else {
        window.alert('Please confirm your criteria before submit request.');
      }
    };

    this.filterResultExport = () => {
      let isReady = this.criteriaComp.isReadyToLeave();

      if (isReady) {
        let criteria = this.getCriteria();
        this.setState({
          //isLoaded: false,
          criteria
        });

        $(this.inputCriteria).val(JSON.stringify(criteria));
        $(this.formComponent).submit();
      } else {
        window.alert('Please confirm your criteria before submit request.');
      }
    };

    this.getHistory = () => {
      this.setState({
        isLoaded: false
      });

      CustomFilterAction.getCriteriaHistory(this.props.params.mdId, this.props.params.batId, data => {
        this.setState(prevState => ({
          isLoaded: true,
          criteria: {
            isIncludeModelTarget: prevState.criteria.isIncludeModelTarget,
            expression: data
          }
        }));
      });
    };

    //this.getHistory();
  };

  componentWillUpdate() {
    console.log('CustomTargetFilterWorker::componentWillUpdate');
  };

  render() {
    return (
      <Loader loaded={this.state.isLoaded}>
        <CustomTargetFilterCriteria params={this.props.params} criteria={this.state.criteria.expression} ref={(e) => {
          this.criteriaComp = e;
        }}/>
        {/*<!-- table set Start -->*/}
        <div className="table_block">
          <h2>自定名單試算與下載</h2>
          <form className="form-horizontal"
                method="POST"
                target="_blank"
                action={format(CustomFilterAction.FILTER_RESULT_EXPORT, this.props.params.mdId, this.props.params.batId)}
                ref={e => {this.formComponent = e;}}>
            <input type="hidden" name="criteria" ref={e => this.inputCriteria = e}/>
            <div className="form-group">
              <label htmlFor="inputName" className="col-sm-3 control-label">是否包含模型受眾</label>
              <div className="col-sm-8">
                <label className="radio-inline">
                  <input type="radio" name="optradio" value={true} defaultChecked={this.state.criteria.isIncludeModelTarget} onClick={this.setIncludeModelTarget}/>是</label>
                <label className="radio-inline">
                  <input type="radio" name="optradio" value={false} defaultChecked={!this.state.criteria.isIncludeModelTarget} onClick={this.setExcludeModelTarget}/>否</label>
              </div>
            </div>
            <CustomTargetFilterPreview prediction={this.state.prediction}/>
          </form>
          <div className="btn-block center-block">
            <button type="submit" className="btn btn-lg btn-default" onClick={this.filterResultPreview}>名單數試算</button>
            <button type="submit" className="btn btn-lg btn-default" onClick={this.filterResultExport}>自定名單下載</button>
          </div>
        </div>
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