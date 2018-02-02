import React from 'react';
import Loader from 'react-loader';
import Rx from 'rxjs';
import {assign} from 'lodash';
import {fromJS, List} from 'immutable';
import {NODE_TYPE_DICT as NODE_TYPE} from '../utils/tree-node-dictionary';
import PickerMultiple from './PickerMultiple';
import moment from "moment/moment";

const setAllOptionNodesIsSelected = (nodesListAsImmutable, selected) => {
  return nodesListAsImmutable.map(nodeMapAsImmutable => {
    switch (nodeMapAsImmutable.get('type')) {
      case NODE_TYPE.Branch:
        return nodeMapAsImmutable.set('nodes', setAllOptionNodesIsSelected(nodeMapAsImmutable.get('nodes'), selected));
      case NODE_TYPE.Tail:
        return nodeMapAsImmutable.set('isSelected', selected);
    }
  })
};

const toggleOptionNodeSelected = (nodesListAsImmutable, uuid) => {
  return nodesListAsImmutable.map(nodeMapAsImmutable => {
    switch (nodeMapAsImmutable.get('type')) {
      case NODE_TYPE.Branch:
        return nodeMapAsImmutable.set('nodes', setAllOptionNodesIsSelected(nodeMapAsImmutable.get('nodes'), uuid));
      case NODE_TYPE.Tail:
        if (nodeMapAsImmutable.get('uuid') === uuid)
          return nodeMapAsImmutable.set('isSelected', !nodeMapAsImmutable.get('isSelected'));
        return nodeMapAsImmutable;
    }
  })
};

const getDatePickerValue = (date) => {
  let value, value_label = null;
  if (date) {
    let m = moment(date).startOf('day');
    value = m.utc().valueOf();
    value_label = m.format('YYYY/MM/DD')
  }
  return {
    value,
    value_label
  };
};

export default class IntegratedAnalysisFeaturePicker extends React.PureComponent {
  constructor(props) {
    super(props);

    let today = getDatePickerValue(new Date());
    this.state = {
      isLoaded: false,
      featureOptions: List(),
      transactionOptions: List(),
      periodStart: today.value,
      periodStartLabel: today.value_label,
      periodEnd: today.value,
      periodEndLabel: today.value_label,
    };
  };

  componentWillMount() {
    this.fetchExportFeatureOptions = (callback) => {
      //TODO:
    };

    this.fetchExportTransactionOptions = (callback) => {
      //TODO:
    };

    this.fetchPreparedData = (callback) => {
      let fetchExportFeatureOptions = Rx.Observable.bindCallback(this.fetchExportFeatureOptions);
      let fetchExportTransactionOptions = Rx.Observable.bindCallback(this.fetchExportTransactionOptions);
      Rx.Observable.concat(fetchExportFeatureOptions, fetchExportTransactionOptions).subscribe(res => {
        callback({
          featureOptions: fromJS(res[0]),
          transactionOptions: fromJS(res[1])
        });
      });
    };

    this.selectAllFeatureHandler = () => {
      let state = setAllOptionNodesIsSelected(this.state.featureOptions, true);
      this.setState({featureOptions: state});
    };

    this.deselectAllHandler = () => {
      let state = setAllOptionNodesIsSelected(this.state.featureOptions, false);
      this.setState({featureOptions: state});
    };

    this.featureTailClickHandler = (node) => {
      let state = toggleOptionNodeSelected(this.state.featureOptions, node.uuid);
      this.setState({featureOptions: state});
    };

    this.transactionTailClickHandler = (node) => {
      let state = toggleOptionNodeSelected(this.state.transactionOptions, node.uuid);
      this.setState({transactionOptions: state});
    };

    this.initDatePicker = (dom, timestampPropsOfState, labelPropsOfState) => {
      $(dom).datepicker({
        format: 'yyyy/mm/dd'
      }).datepicker('setDate', new Date(this.state[timestampPropsOfState]))
        .datepicker('onClose', (dateText, picker) => {
          let data = getDatePickerValue(picker.datepicker('getDate'));
          this.setState({
            [timestampPropsOfState]: data.value,
            [labelPropsOfState]: data.value_label
          });
        });
    };

    this.processPostDate = (e) => {
      //TODO:
    };

    // execute
    this.fetchPreparedData(data => {
      this.setState(assign({
        isLoaded: true
      }, data));
    });
  };

  componentDidMount() {
    this.initDatePicker(this.periodStart, 'periodStart', 'periodStartLabel');
    this.initDatePicker(this.periodEnd, 'periodEnd', 'periodEndLabel');
  };

  render() {
    return (
      <Loader loaded={this.state.isLoaded}>
        <div className="table_block feature">
          <h2>查詢條件</h2>
          <h3>第五步 挑選下載欄位</h3>
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
          <PickerMultiple nodes={this.state.transactionOptions.toJS()} tailClickHandler={this.transactionTailClickHandler}/>
          <div className="btn-block center-block">
            {/*<button type="submit" className="btn btn-lg btn-default">重新挑選客群</button>*/}
            <button type="button" className="btn btn-lg btn-default" onClick={this.processPostDate}>下載資料</button>
          </div>
        </div>
        <form method="POST" action={} ref={e => {this.formComponent = e;}}>
          <input type="hidden" name="criteria" value={null}/>
        </form>
      </Loader>
    );
  };
};