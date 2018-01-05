import React from 'react';
import shortid from "shortid";
import moment from 'moment';
import {find, assign} from 'lodash';
import {OPERATOR_DICT as OPERATOR_DICT_DEFAULT} from '../utils/criteria-dictionary';

const OPERATOR_DICT = assign({}, OPERATOR_DICT_DEFAULT, {
  eq: '=',
  ne: '≠',
  lt: '<',
  le: '<=',
  gt: '>',
  ge: '>=',
  in: '無資料',
  nn: '有資料'
});
const DATA_TYPE_OPERATOR_OPTIONS = (dataType) => {
  switch (dataType) {
    case 'number':
    case 'text':
    case 'date':
      return ['eq', 'ne', 'lt', 'le', 'gt', 'ge', 'in', 'nn'];
    case 'refOption':
      return ['eq', 'ne', 'in', 'nn'];
  }
};
const INITIAL_STATE = {
  type: undefined,
  field_id: undefined,
  field_label: undefined,
  data_type: undefined,
  ref: undefined,
  value: undefined,
  value_label: undefined,
  operator: 'eq'  //for default value
};

export default class CriteriaFieldPicker extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = INITIAL_STATE;  //state is the current criteria properties.
  }

  componentWillUpdate(nextProps, nextState) {
    // console.log('CriteriaFieldPicker::componentWillUpdate: ', nextState);
  };

  openModal(callback) {
    this.responseCriteria = callback;
    this.setState(assign({}/*, INITIAL_STATE*/, {
      uuid: shortid.generate(),
      //TODO: keep current data_type and ref coz the selected filed not be clean yet.
      //data_type: this.state.data_type,
      //ref: this.state.ref
    }));
    $(this.fieldPicker).show();
    $('body').addClass('noscroll');
  };

  closeModal() {
    $(this.fieldPicker).hide();
    $('body').removeClass('noscroll');
  }

  confirmCriteria() {
    let data = this.fieldInput? this.fieldInput.getInputData(): {};
    let c = assign({}, this.state, {
      value: data.value,
      value_label: data.value_label
    });
    // console.log('CriteriaFieldPicker::confirmCriteria: ', c);
    this.responseCriteria(c);
    this.closeModal();
  };

  setCriteria(field) {
    // console.log('CriteriaFieldPicker::mapToProps::setCriteria: ', field);
    this.setState({
      type: field.type,
      field_id: field.id,
      field_label: field.label,
      data_type: field.data_type,
      ref: field.ref,
      //value: 'Y',
      //value_label: '是',
      operator: 'eq'  //for default value
    });
  }

  render() {
    const mapToProps = {
      setCriteria: this.setCriteria.bind(this)
    };

    return (
      <div className="modal" style={{display: 'none'}} ref={(e) => {
        this.fieldPicker = e;
      }}>
        <div className="table_block">
          <h2>新增條件</h2>
          <div className="row">
            <div className="col-md-6">
              <h3>挑選欄位條件</h3>
              <form className="addCondition">
                <ul>
                  {this.props.foldingFields.map((ff) => {
                    if ('field' === ff.type) {
                      return <FieldPicker key={ff.id} field={ff} {...mapToProps}/>;
                    } else {
                      return <FieldFolder key={ff.id} folder={ff} {...mapToProps}/>;
                    }
                  })}
                </ul>
              </form>
            </div>
            <div className="col-md-2">
              {this.CriteriaOperatorBlock()}
            </div>
            <div className="col-md-4">
              {this.CriteriaInputBlock()}
            </div>
          </div>
          <div className="btn-block center-block">
            <button type="submit" className="btn btn-lg btn-default" onClick={this.confirmCriteria.bind(this)}>確定</button>
            <button type="submit" className="btn btn-lg btn-default" onClick={this.closeModal.bind(this)}>取消</button>
          </div>
        </div>
        <div className="overlay" onClick={() => {
          $(this.fieldPicker).hide();
          $('body').removeClass('noscroll');
        }}/>
      </div>
    );
  };

  CriteriaOperatorBlock() {
    if (this.state.data_type) {
      return (
        <div>
          <h3>條件</h3>
          <select className="form-control judgment" onChange={(e) => {
            this.setState({
              operator: e.target.value
            });
          }} value={this.state.operator}>
            {DATA_TYPE_OPERATOR_OPTIONS(this.state.data_type).map((operator) => {
              return (
                <option key={operator} value={operator}>{OPERATOR_DICT[operator]}</option>
              );
            })}
          </select>
        </div>
      );
    }
    return null;
  }

  CriteriaInputBlock() {
    const excludes = ['in', 'nn'];
    if (this.state.data_type && excludes.indexOf(this.state.operator) < 0) {
      return (
        <div>
          <h3>條件值</h3>
          {this.CriteriaFieldInput()}
        </div>
      );
    }
    return null;
  };

  CriteriaFieldInput() {
    switch (this.state.data_type) {
      case 'number':
        return <NumberInput criteria={this.state} ref={(e) => {
          this.fieldInput = e;
        }}/>;
      case 'text':
        return <TextInput criteria={this.state} ref={(e) => {
          this.fieldInput = e;
        }}/>;
      case 'date':
        return <DateInput criteria={this.state} ref={(e) => {
          this.fieldInput = e;
        }}/>;
      case 'refOption':
        return <RefOptionInput criteria={this.state} refOptions={this.props.refOptions} ref={(e) => {
          this.fieldInput = e;
        }}/>;
    }
  };
};

class FieldFolder extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      collapse: true
    }
  }

  render() {
    const folder = this.props.folder;
    let collapse = this.state.collapse;
    let className = 'fa fa-plus';
    let style = {display: 'none'};
    if (!collapse) {
      className += ' fa-minus';
      style = {};
    }
    return (
      <li>
        <a href="#" onClick={() => {
          this.setState({collapse: !this.state.collapse});
        }}>{folder.label} <i className={className} aria-hidden={collapse}/></a>
        <ul style={style}>
          {folder.fields.map((field) => {
            return <FieldPicker key={field.id} {...this.props} field={field} />;
          })}
        </ul>
      </li>
    );
  };
};

class FieldPicker extends React.PureComponent {
  render() {
    return (
      <li className="radio">
        <label>
          <input type="radio" name="optradio" onClick={() => {
            this.props.setCriteria(this.props.field);
          }}/>{this.props.field.label}</label>
      </li>
    );
  };
};

class InputBase extends React.PureComponent {
  constructor(props) {
    super(props);
    // console.log('CriteriaInputBase::constructor: ', this.props.criteria.data_type);
  }

  componentWillUpdate() {
    // console.log('InputBase::componentWillUpdate');
  };

  getInputData() {
    return {
      value: $(this.input).val()
    };
  }

  render() {
    return (
      <div className="radio">
        <input type={this.props.criteria.data_type} className="form-control" placeholder="" ref={(e) => {
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
    let d = $(this.input).datepicker('getDate');
    // console.log('DateInput::getInputData: ', d);
    return {
      value: d? moment(d).utc().valueOf(): null
    };
  }

  componentDidMount() {
    this.datepicker = $(this.input).datepicker({
      dateFormat: "yy-mm-dd"
    });
  };

  render() {
    return (
      <div className="radio">
        <input type="text" className="form-control" placeholder="" ref={(e) => {
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
      let t = find(this.options, {optCode: value});
      return t? t.label: '';
    });
    return {
      value: values,
      value_label: labels
    };
  }

  render() {
    this.options = this.props.refOptions[this.props.criteria.ref];
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
          {this.options.map((opt) => {
            return (
              <div className="checkbox" key={opt.optCode}>
                <label>
                  <input type="checkbox" value={opt.optCode}/>{opt.label}
                </label>
              </div>
            );
          })}
        </div>
      </div>
    );
  }
}