import React from 'react';
import {find} from 'lodash';
import moment from 'moment';
import {default as constants} from '../utils/constants';

export default class CriteriaField extends React.PureComponent {
  constructor(props) {
    super(props);
    //this.state = Object.assign({}, props.criteria);
    /**
     * {
          type: 'field',
          cate: null,
          id: 'last_visit_date',
          label: '最近訪問日',
          value: Date.now(),
          data_type: 'date',
          operator: 'lt'
        }
     */
  }

  componentWillUnmount() {
    console.log('CriteriaField: componentWillUnmount: ', this.props.criteria.key);
  };

  render() {
    let criteria = this.props.criteria;
    // console.log('this.props.refFields: ', this.props.refFields);
    // console.log('criteria.id: ', criteria.id);
    // console.log('this.props.refOptions: ', this.props.refOptions);
    return (
      <div className="con-option">
        <div className="form-group">
          <input type="text" className="form-control" id="" value={this.props.refFields[criteria.id].label} disabled={true}/>
        </div>
        <div className="form-group">
          <input type="text" className="form-control judgment" id="" defaultValue={constants.PREFERRED_OPERATOR[criteria.operator]} disabled={true}/>
        </div>
        <div className="form-group">
          <FieldValue value={criteria.value} field={this.props.refFields[criteria.id]} refOptions={this.props.refOptions}/>
        </div>
        {(this.props.isPreview)? null: <i className="fa fa-times" aria-hidden="true" onClick={() => {
          this.props.removeCriteria(criteria.key);
        }}/>}
      </div>
    );
  }
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
    switch (field.data_type) {
      case 'number':
      case 'text':
        return value;
      case 'refOption':
        return find(refOptions[field.ref], {
          optCode: value
        }).label;
      case 'date':
        return moment(value).format('YYYY/MM/DD');
      default:
        return value;
    }
  }
};