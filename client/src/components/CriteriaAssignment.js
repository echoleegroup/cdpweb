import React from 'react';
import Loader from 'react-loader';
import shortid from 'shortid';
import moment from 'moment';
import {find, assign, pick, isEmpty} from 'lodash';
import {Map} from 'immutable';
import {OPERATOR_DICT as OPERATOR_DICT_DEFAULT} from '../utils/criteria-dictionary';
// import CustomFilterAction from '../actions/criteria-action';
import PickerSingle from './PickerSingle'
import {CRITERIA_COMPONENT_DICT} from "../utils/criteria-dictionary";

const INPUT_CRITERIA_OPERATOR = {
  eq: {
    label: OPERATOR_DICT_DEFAULT.eq,
    dataProcessor: value => value
  },
  ne: {
    label: OPERATOR_DICT_DEFAULT.ne,
    dataProcessor: value => value
  },
  lt: {
    label: OPERATOR_DICT_DEFAULT.lt,
    dataProcessor: value => value
  },
  le: {
    label: OPERATOR_DICT_DEFAULT.le,
    dataProcessor: value => value
  },
  gt: {
    label: OPERATOR_DICT_DEFAULT.gt,
    dataProcessor: value => value
  },
  ge: {
    label: OPERATOR_DICT_DEFAULT.ge,
    dataProcessor: value => value
  },
  in: {
    label: OPERATOR_DICT_DEFAULT.in,
    dataProcessor: value => value
  },
  nn: {
    label: OPERATOR_DICT_DEFAULT.nn,
    dataProcessor: value => value
  }
};

const DATE_CRITERIA_OPERATOR = assign(pick(INPUT_CRITERIA_OPERATOR, ['eq', 'ne', 'le', 'ge', 'in', 'nn']), {
  le: {
    label: OPERATOR_DICT_DEFAULT.le,
    dataProcessor: timestamp => moment(timestamp).endOf('day').valueOf()
  },
  ge: {
    label: OPERATOR_DICT_DEFAULT.ge,
    dataProcessor: timestamp => moment(timestamp).startOf('day').valueOf()
  }
});

const DATETIME_CRITERIA_OPERATOR = assign(pick(INPUT_CRITERIA_OPERATOR, ['eq', 'ne', 'le', 'ge', 'in', 'nn']), {
  le: {
    label: OPERATOR_DICT_DEFAULT.le,
    dataProcessor: timestamp => moment(timestamp).endOf('minute').valueOf()
  },
  ge: {
    label: OPERATOR_DICT_DEFAULT.ge,
    dataProcessor: timestamp => moment(timestamp).startOf('minute').valueOf()
  }
});

const REF_OPTION_CRITERIA_OPERATOR = pick(INPUT_CRITERIA_OPERATOR, ['eq', 'ne', 'in', 'nn']);
REF_OPTION_CRITERIA_OPERATOR.eq.label = '為';
REF_OPTION_CRITERIA_OPERATOR.ne.label = '不為';

const GetOperatorSet = (dataType) => {
  switch (dataType) {
    case 'number':
    case 'text':
      return INPUT_CRITERIA_OPERATOR;
    case 'date':
      return DATE_CRITERIA_OPERATOR;
    case 'datetime':
      return DATETIME_CRITERIA_OPERATOR;
    case 'refOption':
      return REF_OPTION_CRITERIA_OPERATOR;
  }
};
const INITIAL_CRITERIA = Object.freeze({
  uuid: undefined,
  type: CRITERIA_COMPONENT_DICT.FIELD,
  field_id: undefined,
  field_label: undefined,
  data_type: undefined,
  input_type: undefined,
  ref: undefined,
  value: undefined,
  value_label: undefined,
  operator: 'eq'  //for default value
});

export default class CriteriaAssignment extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      isOpen: false,
      collapse: true,
      // features: props.features,
      // featureRefCodeMap: props.featureRefCodeMap,
      criteria: Map(INITIAL_CRITERIA).merge({
        uuid: shortid.generate()
      }),
      selectedFeature: null
    };
  };

  componentWillMount() {
    this.openModal = (callback) => {
      // console.log('CriteriaAssignment::openModal');
      this.responseCriteria = callback;
      this.setState(prevState => ({
        isOpen: true
      }));
      $('body').addClass('noscroll');
    };

    this.closeModal = () => {
      // console.log('CriteriaAssignment closeModal');
      this.setState({
        isOpen: false,
        criteria: Map(INITIAL_CRITERIA).merge({
          uuid: shortid.generate()
        }),
        selectedFeature: null
      });
      $('body').removeClass('noscroll');
    };

    this.confirmCriteria = () => {
      let data = this.fieldInput? this.fieldInput.getInputData(): {};
      // console.log('confirmCriteria this.state.criteria.operator: ', this.state.criteria.get('operator'));
      // console.log('confirmCriteria this.operatorSet[this.state.criteria.operator]: ', this.operatorSet[this.state.criteria.get('operator')]);
      let dataProcessor = this.operatorSet[this.state.criteria.get('operator')].dataProcessor;
      let c = this.state.criteria.merge({
        value: dataProcessor(data.value),
        value_label: data.value_label
      });
      // console.log('CriteriaAssignment::confirmCriteria: ', c);
      this.responseCriteria(c.toJSON());
      this.closeModal();
    };

    this.branchClickHandler = (node) => {
      // console.log('CriteriaAssignment branchClickHandler: ', node);
    };

    this.tailClickHandler = (node) => {
      // console.log('CriteriaAssignment tailClickHandler: ', node);
      this.setState(prevState => {
        return {
          selectedFeature: node.id,
          criteria: prevState.criteria.merge({
            field_id: node.id,
            field_label: node.label,
            data_type: node.data_type,
            input_type: node.input_type,
            ref: node.ref,
            //value: 'Y',
            //value_label: '是',
            operator: 'eq'  //for default value
          })
        }
      });
    };
  };

  render() {
    let display = (this.state.isOpen)? '': 'none';
    return (
      <div className="modal" style={{display: display}}>
        <div className="table_block">
          <h2>新增條件</h2>
          <div className="modalContent">
            <div className="col-md-6">
              <h3>挑選欄位條件</h3>
              <PickerSingle nodes={this.props.features}
                            branchClickHandler={this.branchClickHandler}
                            tailClickHandler={this.tailClickHandler}
                            selectedId={this.state.selectedFeature}/>
            </div>
            <div className="col-md-2">
              {this.CriteriaOperatorBlock(this.state.criteria)}
            </div>
            <div className="col-md-4">
              {this.CriteriaInputBlock(this.state.criteria)}
            </div>
          </div>
          <div className="btn-block center-block">
            <button type="button" className="btn btn-lg btn-default" onClick={this.confirmCriteria}>確定</button>
            <button type="button" className="btn btn-lg btn-default" onClick={this.closeModal}>取消</button>
          </div>
        </div>
        <div className="overlay" onClick={this.closeModal}/>
      </div>
    );
  };

  CriteriaOperatorBlock(criteria) {
    let inputType = criteria.get('input_type');
    // console.log('CriteriaAssignment::CriteriaOperatorBlock.inputType: ', inputType);
    if (isEmpty(inputType)) {
      return null;
    }
    let operatorSet = this.operatorSet = GetOperatorSet(inputType);
    // console.log('CriteriaOperatorBlock this.operatorSet: ', this.operatorSet);
    return (
      <div>
        <h3>條件</h3>
        <select className="form-control judgment" onChange={(e) => {
          let inputValue = e.target.value;
          this.setState((prevState) => {
            return {
              criteria: prevState.criteria.set('operator', inputValue)
            };
          });
        }} value={criteria.get('operator')}>
          {Object.keys(operatorSet).map((key) => {
            return (
              <option key={key} value={key}>{operatorSet[key].label}</option>
            );
          })}
        </select>
      </div>
    );
  };

  CriteriaInputBlock(criteria) {
    const excludes = ['in', 'nn'];
    let input_type = criteria.get('input_type');
    if (input_type && excludes.indexOf(criteria.get('operator')) < 0) {
      return (
        <div>
          <h3>條件值</h3>
          {this.CriteriaFieldInput(criteria, input_type)}
        </div>
      );
    }
    return null;
  };

  CriteriaFieldInput(criteria) {
    switch (criteria.get('input_type')) {
      case 'number':
        return <NumberInput criteria={criteria} ref={(e) => {
          this.fieldInput = e;
        }}/>;
      case 'text':
        return <TextInput criteria={criteria} ref={(e) => {
          this.fieldInput = e;
        }}/>;
      case 'date':
        return <DateInput criteria={criteria} ref={(e) => {
          this.fieldInput = e;
        }}/>;
      case 'refOption':
        console.log('this.state.criteria == refOption: ', this.props.featureRefCodeMap[this.state.criteria.get('ref')]);
        return <RefOptionInput criteria={criteria} refOptions={this.props.featureRefCodeMap[this.state.criteria.get('ref')]} ref={(e) => {
          this.fieldInput = e;
        }}/>;
    }
  };
};

class InputBase extends React.PureComponent {
  getInputData() {
    let value = $(this.input).val();
    return {
      value,
      value_label: value
    };
  }

  render() {
    return (
      <div className="radio">
        <input type={this.props.criteria.get('input_type')} className="form-control" placeholder="" ref={(e) => {
          this.input = e;
        }}/>
      </div>
    );
  }
}

class NumberInput extends InputBase {}

class TextInput extends InputBase {}

class DateInput extends InputBase {
  getInputData() {
    let d = this.datepicker.datepicker('getDate');
    let value, value_label = null;
    if (d) {
      let m = moment(d);
      value = m.valueOf();
      value_label = m.format('YYYY/MM/DD')
    }
    // console.log('DateInput::getInputData: ', d);
    return {
      value,
      value_label
    };
  }

  componentDidMount() {
    this.datepicker = $(this.input).datepicker({
      format: 'yyyy/mm/dd'
    }).datepicker('setDate', new Date());
  };

  render() {
    return (
      <div className="radio">
        <input type="text" className="form-control" readOnly={true} ref={(e) => {
          this.input = e;
        }}/>
      </div>
    );
  }
}

class RefOptionInput extends InputBase {
  getInputData() {
    let values = $(this.optionDivDom).find('input:checked').map((i, e) => {
      return e.value;
    }).get();
    let labels = values.map((value) => {
      let t = find(this.props.refOptions, {codeValue: value});
      return t? t.codeLabel: '';
    });
    return {
      value: values,
      value_label: labels
    };
  }

  render() {
    return (
      <div>
        <div className="btn-block">
          <button type="button" className="btn btn-sm btn-default" onClick={(e) => {
            $(this.optionDivDom).find('input').attr('checked', true);
          }}>全選</button>
          <button type="button" className="btn btn-sm btn-default" onClick={(e) => {
            $(this.optionDivDom).find('input').attr('checked', false);
          }}>全不選</button>
        </div>
        <div className="category_select" ref={(e) => {
          this.optionDivDom = e;
        }}>
          {this.props.refOptions.map(opt => {
            return (
              <div className="checkbox" key={opt.codeValue}>
                <label>
                  <input type="checkbox" value={opt.codeValue}/>{opt.codeLabel}
                </label>
              </div>
            );
          })}
        </div>
      </div>
    );
  }
}