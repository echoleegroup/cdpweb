import React from 'react';
import Loadable from 'react-loading-overlay';
import shortid from 'shortid';
import moment from 'moment';
import {find, assign, pick, isEmpty} from 'lodash';
import {Map} from 'immutable';
import {CRITERIA_COMPONENT_DICT, OPERATOR_DICT as OPERATOR_DICT_DEFAULT} from '../utils/criteria-dictionary';
import PickerSingle from './PickerSingle'
import 'flatpickr/dist/themes/material_green.css';
import Flatpickr from 'react-flatpickr';
import {getDate} from '../utils/date-util';
import AlertMessenger from "./AlertMessenger";

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

const GetOperatorSet = (input_type) => {
  switch (input_type) {
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
  id: undefined,
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

export default class ModalCriteriaSetter extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      isOpen: false,
      collapse: true,
      // features: props.features,
      // featureRefCodeMap: props.featureRefCodeMap,
      criteria: Map(INITIAL_CRITERIA).merge({
        id: shortid.generate()
      }),
      selectedFeature: null,
      message_error: undefined
    };
  };

  componentWillMount() {
    this.openModal = (callback) => {
      this.responseCriteria = callback;
      this.setState(prevState => ({
        isOpen: true
      }));
      $('body').addClass('noscroll');
    };

    this.closeModal = () => {
      this.setState({
        isOpen: false,
        criteria: Map(INITIAL_CRITERIA).merge({
          id: shortid.generate()
        }),
        selectedFeature: null,
        message_error: undefined
      });
      $('body').removeClass('noscroll');
    };

    this.confirmCriteria = () => {
      let data = this.valueSetter.getInputData();
      if (isEmpty(data.message_error)) {
        // console.log('confirmCriteria this.state.criteria.operator: ', this.state.criteria.get('operator'));
        // console.log('confirmCriteria this.operatorSet[this.state.criteria.operator]: ', this.operatorSet[this.state.criteria.get('operator')]);
        let dataProcessor = this.operatorSet[this.state.criteria.get('operator')].dataProcessor;
        let c = this.state.criteria.merge({
          value: dataProcessor(data.value),
          value_label: data.value_label
        });
        this.responseCriteria(c.toJSON());
        this.closeModal();
      } else {
        this.setState({
          message_error: data.message_error
        })
      }
    };

    this.branchClickHandler = (node) => {
      // console.log('CriteriaAssignment branchClickHandler: ', node);
    };

    this.tailClickHandler = (node) => {
      this.setState(prevState => {
        return {
          selectedFeature: node,
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

    this.operatorChangeHandler = (value) => {
      this.setState((prevState) => {
        return {
          criteria: prevState.criteria.set('operator', value)
        };
      });
    };
  };

  render() {
    let display = (this.state.isOpen)? '': 'none';
    this.operatorSet = GetOperatorSet(this.state.criteria.get('input_type'));
    return (
      <div className="modal" style={{display: display}}>
        <div className="table_block">
          <Loadable active={!this.props.isLoaded} spinner>
            <h2>新增條件</h2>
            <div className="modalContent">
              <div className="col-md-6">
                <h3>挑選欄位條件</h3>
                <PickerSingle nodes={this.props.features}
                              branchClickHandler={this.branchClickHandler}
                              tailClickHandler={this.tailClickHandler}
                              selected={this.state.selectedFeature}/>
              </div>
              <div className="col-md-2">
                <OperatorSelector criteria={this.state.criteria}
                                  operators={this.operatorSet}
                                  operatorChangeHandler={this.operatorChangeHandler}/>
              </div>
              <div className="col-md-4">
                <FieldValueSetter criteria={this.state.criteria}
                                  refOptions={this.props.featureRefCodeMap[this.state.criteria.get('ref')] || []}
                                  ref={(e) => {this.valueSetter = e;}}/>
              </div>
            </div>
            <AlertMessenger message_error={this.state.message_error}/>
            <div className="btn-block center-block">
              <button type="button" className="btn btn-lg btn-default" onClick={this.confirmCriteria}>確定</button>
              <button type="button" className="btn btn-lg btn-default" onClick={this.closeModal}>取消</button>
            </div>
          </Loadable>
        </div>
        <div className="overlay" onClick={this.closeModal}/>
      </div>
    );
  };
};

class FieldValueSetter extends React.PureComponent {
  componentWillMount() {

    this.inputComponentDispatcher = (inputType) => {
      switch (inputType) {
        case 'number':
          return NumberInput;
        case 'text':
          return TextInput;
        case 'date':
          return DateInput;
        case 'refOption':
          return RefOptionInput;
      }
    };

    this.getInputData = () => {
      if (this.valueInput) {
        return this.valueInput.getInputData();
      } else {
        return {};
      }
    };
  };

  render() {
    const excludes = ['in', 'nn'];
    let criteria = this.props.criteria;
    let inputType = criteria.get('input_type');
    let ComponentValueInput = this.inputComponentDispatcher(inputType);

    if (inputType && excludes.indexOf(criteria.get('operator')) < 0) {
      return (
        <div>
          <h3>條件值</h3>
          <ComponentValueInput criteria={criteria}
                               refOptions={this.props.refOptions}
                               ref={(e) => {this.valueInput = e;}}/>
        </div>
      );
    }
    return null;
  };
}

class OperatorSelector extends React.PureComponent {
  render() {
    let criteria = this.props.criteria;
    let optionsMap = this.props.operators;
    if (isEmpty(optionsMap)) {
      return null;
    }
    // let operatorSet = this.operatorSet = GetOperatorSet(inputType);
    // console.log('CriteriaOperatorBlock this.operatorSet: ', this.operatorSet);
    return (
      <div>
        <h3>條件</h3>
        <select className="form-control judgment" onChange={(e) => {
          let inputValue = e.target.value;
          this.props.operatorChangeHandler(inputValue);
        }} value={criteria.get('operator')}>
          {Object.keys(optionsMap).map(key => {
            return (
              <option key={key} value={key}>{optionsMap[key].label}</option>
            );
          })}
        </select>
      </div>
    );
  };
};

class InputBase extends React.PureComponent {
  getInputData() {
    let value = this.getValue(this.input);
    let message = this.validate(value);
    return message? {
      message_error: message
    }: {
      value,
      value_label: this.getValueLabel(value)
    };
  }

  validate(value) {
    return isEmpty(value)? '請輸入條件值': null;
  };

  getValue(inputElement) {
    return $(inputElement).val();
  }

  getValueLabel(value) {
    return value;
  };

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

class NumberInput extends InputBase {
  validate(value) {
    const regex = /^\-{0,1}([0-9]+|[0-9]+\.[0-9]+)$/g;
    return regex.test(value)? null: '請輸入正確數字';
  };
}

class TextInput extends InputBase {}

class DateInput extends InputBase {
  constructor(props) {
    super(props);
    let today = getDate();
    this.state = {
      value: today.value,
      value_label: today.value_label
    };
  };

  getInputData() {
    return this.state;
  }

  render() {
    return (
      <div className="radio">
        <Flatpickr options={{
          dateFormat: "Y/m/d",
          defaultDate: new Date(this.state.value),
          // inline: true,
          onChange: (selectedDates, dateStr) => {
            this.setState({
              value: selectedDates[0].getTime(),
              value_label: dateStr
            });
          }
        }}/>
      </div>
    );
  }
}

class RefOptionInput extends InputBase {

  getValue(element) {
    return $(element).find('input:checked').map((i, e) => {
      return e.value;
    }).get();
  }

  getValueLabel(values) {
    return values.map(value => {
      let t = find(this.props.refOptions, {codeValue: value});
      return t? t.codeLabel: '';
    });
  }

  render() {
    return (
      <div>
        <div>
          <button type="button" className="btn btn-sm btn-default" onClick={(e) => {
            $(this.input).find('input').attr('checked', true);
          }}>全選</button>
          <button type="button" className="btn btn-sm btn-default" onClick={(e) => {
            $(this.input).find('input').attr('checked', false);
          }}>全不選</button>
        </div>
        <div className="category_select" ref={(e) => {
          this.input = e;
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