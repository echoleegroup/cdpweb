import React from 'react';
import {find, assign} from 'lodash';
import moment from 'moment';
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

export default class CriteriaField extends React.PureComponent {
  constructor(props) {
    super(props);
    //this.state = assign({}, props.criteria);

    this.OPERATOR_DICT = OPERATOR_DICT;
    /**
     * {
          uuid: 'xdsfa',
          type: 'field',
          cate: null,
          field_id: 'last_visit_date',
          field_label: '最近訪問日',
          value: Date.now(),
          data_type: 'date',
          operator: 'lt'
        }
     */
  }

  componentWillMount() {
    // console.log('CriteriaField: componentWillMount: ', this.props.criteria);
    this.field_label = this.props.field.label;
    this.value_label = this.displayTextFormatter(this.props.criteria.value, this.props.field, this.props.refOptions);

    this.getCriteria = () => {
      return assign({}, this.props.criteria, {
        field_label: this.props.field.label,
        value_label: this.value_label
      });
    };

    this.props.collectCriteriaComponents(this.props.criteria.uuid, this);
  };

  componentWillUpdate(nextProps, nextState) {
    // console.log('CriteriaField: componentWillUpdate: ', nextProps);
  };

  componentWillUnmount() {
    console.log('CriteriaField::componentWillUnmount: ', this.props.criteria);
    this.props.removeCriteriaComponents(this.props.criteria.uuid);
  };

  render() {
    let criteria = this.props.criteria;
    // console.log('this.props.fieldDictionary: ', this.props.fieldDictionary);
    // console.log('criteria.id: ', criteria.id);
    // console.log('this.props.refOptions: ', this.props.refOptions);
    return (
      <div className="con-option">
        <div className="form-group">
          <input type="text" className="form-control" id="" value={this.field_label} disabled={true}/>
        </div>
        <div className="form-group">
          <input type="text" className="form-control judgment" id="" defaultValue={this.OPERATOR_DICT[criteria.operator]} disabled={true}/>
        </div>
        <div className="form-group">
          <input type="text"
                 className="form-control"
                 defaultValue={this.value_label}
                 disabled={true}/>
        </div>
        {(this.props.isPreview)? null: <i className="fa fa-times" aria-hidden="true" onClick={() => {
          // console.log('CriteriaField::onClick::removeCriteria: ', criteria.uuid);
          this.props.removeCriteria(this.props.index);
        }}/>}
      </div>
    );
  };

  displayTextFormatter(value, field, refOptions) {
    // console.log('value: ', value);
    // console.log('field.ref: ', field);
    // console.log('refOptions: ', refOptions);
    // console.log('refOptions[field.ref]: ', refOptions[field.ref]);
    if(!value)
      return null;

    switch (field.data_type) {
      case 'number':
      case 'text':
        return value;
      case 'refOption':
        let refDict = refOptions[field.ref];
        return value.map((v) => {
          return '[' + find(refDict, {
            optCode: v
          }).label + ']';
        }).join(', ')
      case 'date':
        return moment(value).format('YYYY/MM/DD');
      default:
        return value;
    }
  };
};

class FieldValue extends React.PureComponent {
  render() {
    return (
      <input type="text"
             className="form-control"
             defaultValue={this.displayTextFormatter(this.props.value, this.props.field, this.props.refOptions)}
             disabled={true}/>
    );
  };

  displayTextFormatter(value, field, refOptions) {
    // console.log('value: ', value);
    // console.log('field.ref: ', field.ref);
    // console.log('refOptions: ', refOptions);
    // console.log('refOptions[field.ref]: ', refOptions[field.ref]);
    if(!value)
      return null;

    switch (field.data_type) {
      case 'number':
      case 'text':
        return value;
      case 'refOption':
        let refDict = refOptions[field.ref];
        return value.map((v) => {
          return '[' + find(refDict, {
            optCode: v
          }).label + ']';
        }).join(', ')
      case 'date':
        return moment(value).format('YYYY/MM/DD');
      default:
        return value;
    }
  };
};