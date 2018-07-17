import React from 'react';
import Loader from 'react-loader';
import numeral from 'numeral';
import {format} from 'util';
import {Map} from 'immutable';
import AlertMessenger from './AlertMessenger';
import CustomTargetFilterCriteria from './CustomTargetCriteria';
import {FILTER_RESULT_EXPORT, getCustomTargetFilterPreview, getCriteriaHistory} from '../actions/custom-filter-action';

const ALLOW_DOWNLOAD_THRESHOLD = 30000;

export default class CustomTargetFilter extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      isLoaded: true,
      allowDownload: false,
      criteria: Map({
        isIncludeModelTarget: true,
        statements: []
      }),
      prediction: {
        size: 0,
        model_target: 0
      },
      message_error: undefined
    };
  };

  componentWillMount() {
    this.setIncludeModelTarget = () => {
      return (e) => {
        this.setState(prevState => ({
          criteria: prevState.criteria.set('isIncludeModelTarget', true)
        }), this.filterResultPreview);
      };
    };

    this.setExcludeModelTarget = () => {
      return (e) => {
        this.setState(prevState => ({
          criteria: prevState.criteria.set('isIncludeModelTarget', false)
        }), this.filterResultPreview);
      };
    };

    this.criteriaGathering = () => {
      return {
        isIncludeModelTarget: this.state.criteria.get('isIncludeModelTarget'),
        statements: this.criteriaComp.getCriteria()
      };
    };

    this.filterResultPreview = () => {
      let isReady = this.criteriaComp.isReadyToLeave();

      if (isReady) {
        let criteria = this.criteriaGathering();
        this.setState(prevState => ({
          // isLoaded: false,
          criteria: prevState.criteria
            // .set('isIncludeModelTarget', criteria.isIncludeModelTarget)
            .set('statements', criteria.statements)
        }));

        getCustomTargetFilterPreview(this.props.params.mdId, this.props.params.batId, criteria, data => {
          const allowDownload = data.sizeOfCriteriaResult <= ALLOW_DOWNLOAD_THRESHOLD;
          this.setState({
            isLoaded: true,
            allowDownload,
            prediction: {
              sizeOfResults: data.sizeOfCriteriaResult,
              sizeOfResultsInTarget: data.sizeOfResultsInTarget
            },
            message_error: allowDownload? undefined: '名單人數過多，無法提供下載，請調整查詢條件'
          });
        });
      } else {
        this.setState({
          message_error: '請先完成條件編輯'
        });
      }
    };

    this.filterResultExport = () => {
      let isReady = this.criteriaComp.isReadyToLeave();

      if (isReady) {
        let criteria = this.criteriaGathering();
        this.setState(prevState => ({
          criteria: prevState.criteria
            .set('isIncludeModelTarget', criteria.isIncludeModelTarget)
            .set('statements', criteria.statements)
        }));

        $(this.inputCriteria).val(JSON.stringify(criteria));
        $(this.formComponent).submit();
      } else {
        this.setState({
          message_error: '請先完成條件編輯'
        });
      }
    };

    this.changeViewHandler = (isPreview) => {
      console.log('criteria preview mode: ', isPreview);
      if (isPreview) {
        //trigger query
        this.filterResultPreview();
      } else {
        this.setState({
          allowDownload: false
        })
      }
    };

    // this.getHistory = () => {
    //   this.setState({
    //     isLoaded: false
    //   });
    //
    //   getCriteriaHistory(this.props.params.mdId, this.props.params.batId, data => {
    //     this.setState(prevState => ({
    //       isLoaded: true,
    //       criteria: {
    //         isIncludeModelTarget: prevState.criteria.isIncludeModelTarget,
    //         statements: data
    //       }
    //     }));
    //   });
    // };

  };

  render() {
    let isIncludeModelTarget = this.state.criteria.get('isIncludeModelTarget')
    return (
      <Loader loaded={this.state.isLoaded}>
        <CustomTargetFilterCriteria params={this.props.params}
                                    criteria={this.state.criteria.get('statements')}
                                    changeViewHandler={this.changeViewHandler}
                                    ref={(e) => {
                                      this.criteriaComp = e;
                                    }}/>
        {/*<!-- table set Start -->*/}
        <div className="table_block">
          <h2>自定名單試算與下載</h2>
          <form className="form-horizontal"
                method="POST"
                target="_blank"
                action={format(FILTER_RESULT_EXPORT, this.props.params.mdId, this.props.params.batId)}
                ref={e => {this.formComponent = e;}}>
            <input type="hidden" name="criteria" ref={e => this.inputCriteria = e}/>
            <div className="form-group">
              <label htmlFor="inputName" className="col-sm-3 control-label">是否包含模型受眾</label>
              <div className="col-sm-8">
                <label className="radio-inline">
                  <input type="radio" name="optradio" value={true}
                         defaultChecked={isIncludeModelTarget}
                         onClick={this.setIncludeModelTarget()}/>是</label>
                <label className="radio-inline">
                  <input type="radio" name="optradio" value={false}
                         defaultChecked={!isIncludeModelTarget}
                         onClick={this.setExcludeModelTarget()}/>否</label>
              </div>
            </div>
            <CustomTargetFilterPreview prediction={this.state.prediction}/>
          </form>
          <AlertMessenger message_error={this.state.message_error}/>
          <div className="btn-block center-block">
            <button type="submit" className="btn btn-lg btn-default" disabled={!this.state.allowDownload}
                    onClick={this.filterResultExport}>自定名單下載</button>
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