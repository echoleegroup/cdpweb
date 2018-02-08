import React from 'react';
import {fromJS, List} from 'immutable';
import {xor} from 'lodash';
import {NODE_TYPE_DICT as NODE_TYPE} from '../utils/tree-node-util';
import {getDate} from '../utils/date-util';
import PickerMultiple from './PickerMultiple';
import integratedAction from '../actions/integrated-analysis-action'

const extractAllNodeId = (nodes) => {
  return nodes.reduce((accumulator, node) => {
    switch (node.type) {
      case NODE_TYPE.Branch:
        accumulator = accumulator.concat(extractAllNodeId(node.children));
      case NODE_TYPE.Tail:
        accumulator.push(node.id);
    }
    return accumulator;
  }, []);
};

const toggleList = (id, target) => {
  return xor(target, [id]);
};

export default class IntegratedAnalysisFeaturePicker extends React.PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      // featureOptions: fromJS(props.outputFeatures.featureOptions),
      // relativeSetOptions: fromJS(props.outputFeatures.relativeSetOptions),
      periodStart: props.periodStart,
      periodStartLabel: props.periodStartLabel,
      periodEnd: props.periodEnd,
      periodEndLabel: props.periodEndLabel,
      selectedFeatureId: props.selectedFeatureId,
      selectedRelativeId: props.selectedRelativeId
    };
  };

  componentWillMount() {

    this.selectAllFeatureHandler = () => {
      let allNodeId = extractAllNodeId(this.props.featureOptions);
      this.setState({
        selectedFeatureId: List(allNodeId)
      });
    };

    this.deselectAllHandler = () => {
      this.setState({
        selectedFeatureId: List()
      });
    };

    this.featureTailClickHandler = (node) => {
      this.setState(prevState => ({
        selectedFeatureId: List(toggleList(node.id, prevState.selectedFeatureId))
      }));
    };

    this.relativeTailClickHandler = (node) => {
      this.setState(prevState => ({
        selectedRelativeId: List(toggleList(node.id, prevState.selectedRelativeId))
      }));
    };

    this.initDatePicker = (dom, timestampPropsOfState, labelPropsOfState) => {
      $(dom).datepicker({
        format: 'yyyy/mm/dd'
      }).datepicker('setDate', new Date(this.state[timestampPropsOfState]))
        .datepicker('onClose', (dateText, picker) => {
          let data = getDate(picker.datepicker('getDate'));
          this.setState({
            [timestampPropsOfState]: data.value,
            [labelPropsOfState]: data.value_label
          });
        });
    };

    this.getExportOutputConfig = () => {
      return this.state;
    };

    this.processPostDate = (e) => {
      let criteria = this.props.criteria.toJS();
      let selectedFeatures = this.state.selectedFeatureId.toJS();
      let selectedRelativeSets = this.state.selectedRelativeId.toJS();

      let formDate = {
        criteria,
        export: {
          master: selectedFeatures,
          relatives: selectedRelativeSets
        },
        filter: {
          relatives: {
            period_start_value: this.state.periodStart,
            period_start_label: this.state.periodStartLabel,
            period_end_value: this.state.periodEnd,
            period_end_label: this.state.periodEndLabel
          }
        }
      };

      $(this.inputCriteria).val(JSON.stringify(formDate));
      $(this.formComponent).submit();
    }
  };

  componentDidMount() {
    this.initDatePicker(this.periodStart, 'periodStart', 'periodStartLabel');
    this.initDatePicker(this.periodEnd, 'periodEnd', 'periodEndLabel');
  };

  render() {
    return (
      <div className="table_block feature">
        <h2>查詢條件</h2>
        <h3>第七步 挑選下載欄位</h3>
        <h4>挑選下載欄位</h4>
        <div className="btn-block text-left">
          <button type="button" className="btn btn-sm btn-default" onClick={this.selectAllFeatureHandler}>全選</button>
          <button type="button" className="btn btn-sm btn-default" onClick={this.deselectAllHandler}>全不選</button>
        </div>
        <PickerMultiple nodes={this.props.featureOptions.toJS()}
                        selectedId={this.state.selectedFeatureId}
                        tailClickHandler={this.featureTailClickHandler}/>
        <h4>挑選下載明細資訊</h4>
        <div className="form-group">
          <label htmlFor="inputName" className="col-sm-3 control-label form-inline">明細時間區間</label>
          <div className="col-sm-7">
            <div className="form-inline">
              <input type="text" className="form-control" id="periodStart" readOnly={true} ref={(e) => {
                this.periodStart = e;
              }}/>
              <span> ~ </span>
              <input type="text" className="form-control" id="periodEnd" readOnly={true} ref={(e) => {
                this.periodEnd = e;
              }}/>
            </div>
          </div>
        </div>
        <PickerMultiple nodes={this.props.relativeSetOptions.toJS()}
                        selectedId={this.state.selectedRelativeId}
                        tailClickHandler={this.relativeTailClickHandler}/>
        <div className="btn-block center-block">
          {/*<button type="submit" className="btn btn-lg btn-default">重新挑選客群</button>*/}
          <button type="button" className="btn btn-lg btn-default" onClick={this.processPostDate}>下載資料</button>
        </div>
        <form method="POST" action={integratedAction.EXPORT_QUERY} ref={e => {this.formComponent = e;}}>
          <input type="hidden" name="criteria" value="" ref={e => this.inputCriteria = e}/>
        </form>
      </div>
    );
  };
};