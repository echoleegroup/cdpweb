import React from 'react';
import {fromJS, List} from 'immutable';
import {NODE_TYPE_DICT as NODE_TYPE} from '../utils/tree-node-util';
import {getDate} from '../utils/date-util';
import PickerMultiple from './PickerMultiple';
import integratedAction from '../actions/integrated-analysis-action'

const IS_CHECKED_ATTRIBUTE = 'isChecked';

const setAllOptionNodesIsSelected = (nodeListImmutable, selected) => {
  return nodeListImmutable.map(nodeImmutable => {
    switch (nodeImmutable.get('type')) {
      case NODE_TYPE.Branch:
        return nodeImmutable.set('nodes', setAllOptionNodesIsSelected(nodeImmutable.get('nodes'), selected));
      case NODE_TYPE.Tail:
        return nodeImmutable.set(IS_CHECKED_ATTRIBUTE, selected);
    }
  })
};

const toggleOptionNodeSelected = (nodeListImmutable, id) => {
  return nodeListImmutable.map(nodeImmutable => {
    switch (nodeImmutable.get('type')) {
      case NODE_TYPE.Branch:
        return nodeImmutable.set('nodes', setAllOptionNodesIsSelected(nodeImmutable.get('nodes'), id));
      case NODE_TYPE.Tail:
        if (nodeImmutable.get('id') === id)
          return nodeImmutable.set(IS_CHECKED_ATTRIBUTE, !nodeImmutable.get(IS_CHECKED_ATTRIBUTE));
        return nodeImmutable;
    }
  })
};

const getSelectedNodes = (nodeListImmutable) => {
  return nodeListImmutable.reduce((acc, nodeImmutable) => {
    switch (nodeImmutable.get('type')) {
      case NODE_TYPE.Branch:
        return acc.concat(getSelectedNodes(nodeImmutable.get('nodes')));
      case NODE_TYPE.Tail:
        if (nodeImmutable.get(IS_CHECKED_ATTRIBUTE))
          acc.push(nodeImmutable.get('id'));
        return acc;
    }
  }, []);
};

export default class IntegratedAnalysisFeaturePicker extends React.PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      featureOptions: fromJS(props.outputFeatures.featureOptions),
      relativeSetOptions: fromJS(props.outputFeatures.relativeSetOptions),
      periodStart: props.outputFeatures.periodStart,
      periodStartLabel: props.outputFeatures.periodStartLabel,
      periodEnd: props.outputFeatures.periodEnd,
      periodEndLabel: props.outputFeatures.periodEndLabel,
    };
  };

  componentWillMount() {

    this.selectAllFeatureHandler = () => {
      let state = setAllOptionNodesIsSelected(this.state.featureOptions, true);
      this.setState({featureOptions: state});
    };

    this.deselectAllHandler = () => {
      let state = setAllOptionNodesIsSelected(this.state.featureOptions, false);
      this.setState({featureOptions: state});
    };

    this.featureTailClickHandler = (node) => {
      let state = toggleOptionNodeSelected(this.state.featureOptions, node.id);
      this.setState({featureOptions: state});
    };

    this.transactionTailClickHandler = (node) => {
      let state = toggleOptionNodeSelected(this.state.relativeSetOptions, node.id);
      this.setState({relativeSetOptions: state});
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
      return {
        featureOptions: this.state.featureOptions.toJS(),
        relativeSetOptions: this.state.relativeSetOptions.toJS(),
        periodStart: this.state.periodStart,
        periodStartLabel: this.state.periodStartLabel,
        periodEnd: this.state.periodEnd,
        periodEndLabel: this.state.periodEndLabel,
      };
    };

    this.processPostDate = (e) => {
      //TODO:
      let criteria = this.props.criteria;
      let selectedFeatures = getSelectedNodes(this.state.featureOptions);
      let selectedRelativeSets = getSelectedNodes(this.state.relativeSetOptions);

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
        <PickerMultiple nodes={this.state.featureOptions.toJS()} tailClickHandler={this.featureTailClickHandler}/>
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
        <PickerMultiple nodes={this.state.relativeSetOptions.toJS()} tailClickHandler={this.transactionTailClickHandler}/>
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