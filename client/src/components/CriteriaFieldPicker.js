import React from 'react';
import shortid from "shortid";
import moment from 'moment';
import {find, assign} from 'lodash';
import {Map} from 'immutable';
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
const INITIAL_CRITERIA = () => {
  const state = {
    uuid: undefined,
    type: undefined,
    field_id: undefined,
    field_label: undefined,
    data_type: undefined,
    ref: undefined,
    value: undefined,
    value_label: undefined,
    operator: 'eq'  //for default value
  };

  return Map(state);
}

export default class CriteriaFieldPicker extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      isOpen: false,
      collapse: true,
      criteria: INITIAL_CRITERIA()
    };
  };

  componentWillMount() {
    this.openModal = (callback) => {
      // console.log('CriteriaFieldPicker::openModal');
      this.responseCriteria = callback;
      this.setState({
        isOpen: true,
        criteria: INITIAL_CRITERIA().merge({
          uuid: shortid.generate()
        })
      });
      $('body').addClass('noscroll');
    };

    this.closeModal = () => {
      this.setState({
        isOpen: false
      });
      $('body').removeClass('noscroll');
    };

    this.confirmCriteria = () => {
      let data = this.fieldInput? this.fieldInput.getInputData(): {};
      let c = this.state.criteria.merge({
        value: data.value,
        value_label: data.value_label
      });
      // console.log('CriteriaFieldPicker::confirmCriteria: ', c);
      this.responseCriteria(c.toJSON());
      this.closeModal();
    };

    this.setCriteria = (field) => {
      this.setState((prevState) => {
        return {
          criteria: prevState.criteria.merge({
            type: field.type,
            field_id: field.id,
            field_label: field.label,
            data_type: field.data_type,
            ref: field.ref,
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
      <div className="modal" style={{display: display}} ref={(e) => {
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
                      return this.FieldPicker(ff);
                    } else {
                      return this.FieldFolder(ff);
                    }
                  })}
                </ul>
              </form>
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
        <div className="overlay" onClick={() => {
          this.setState({
            isOpen: false
          });
          $('body').removeClass('noscroll');
        }}/>
      </div>
    );
  };

  FieldFolder(folder) {
    // console.log('CriteriaFieldPicker::FieldFolder: ');
    let collapse = true;  //this.state.collapse;
    let className = 'fa fa-plus';
    let style = {display: 'none'};
    let iconDom, itemDom = null;
    /*
    if (!collapse) {
      className += ' fa-minus';
      style = {};
    }*/
    return (
      <li key={folder.id}>
        <a href="#" onClick={() => {
          $(itemDom).toggle();
          $(iconDom).toggleClass('fa-minus');
        }}>{folder.label}
          <i className={className} aria-hidden={collapse} ref={(e) => {
            iconDom = e;
          }}/>
        </a>
        <ul style={style} ref={(e) => {
          itemDom = e;
        }}>
          {folder.fields.map((field) => {
            return this.FieldPicker(field)
          })}
        </ul>
      </li>
    );
  };

  FieldPicker(field) {
    // console.log('field.id: ', field.id);
    // console.log('this.state.criteria: ', this.state.criteria);
    // console.log('this.state.criteria.field_id: ', this.state.criteria.get('field_id'));
    return (
      <li className="radio" key={field.id}>
        <label>
          <input type="radio" name="optradio" checked={field.id === this.state.criteria.get('field_id')}
                 onClick={(e) => {
                   this.setCriteria(field);
                 }}/>{field.label}</label>
      </li>
    );
  };

  CriteriaOperatorBlock(criteria) {
    // console.log('CriteriaFieldPicker::CriteriaOperatorBlock: ', criteria);
    if (criteria.get('data_type')) {
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
            {DATA_TYPE_OPERATOR_OPTIONS(criteria.get('data_type')).map((operator) => {
              return (
                <option key={operator} value={operator}>{OPERATOR_DICT[operator]}</option>
              );
            })}
          </select>
        </div>
      );
    }
    return null;
  };

  CriteriaInputBlock(criteria) {
    const excludes = ['in', 'nn'];
    if (criteria.get('data_type') && excludes.indexOf(criteria.get('operator')) < 0) {
      return (
        <div>
          <h3>條件值</h3>
          {this.CriteriaFieldInput(criteria)}
        </div>
      );
    }
    return null;
  };

  CriteriaFieldInput(criteria) {
    switch (criteria.get('data_type')) {
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
        return <RefOptionInput criteria={criteria} refOptions={this.props.refOptions[this.state.criteria.get('ref')]} ref={(e) => {
          this.fieldInput = e;
        }}/>;
    }
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
        <input type={this.props.criteria.get('data_type')} className="form-control" placeholder="" ref={(e) => {
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
    this.options = this.props.refOptions;
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