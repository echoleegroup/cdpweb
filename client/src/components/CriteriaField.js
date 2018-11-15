import React from 'react';
import {isNull, assign} from 'lodash';
// import moment from 'moment';
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
  }

  componentWillMount() {
    let criteria = this.props.criteria;
    // console.log('CriteriaField: componentWillMount: ', this.props.criteria);
    this.field_label = this.props.criteria.field_label;
    this.value_label = this.displayTextFormatter(criteria.input_type, criteria.value, criteria.value_label);

    this.criteriaGathering = () => {
      return this.props.criteria;
    };
  };

  componentDidMount() {
    this.props.collectCriteriaComponents(this.props.criteria.id, this);
  };

  componentWillUpdate(nextProps, nextState) {
    // console.log('CriteriaField: componentWillUpdate: ', nextProps);
  };

  componentWillUnmount() {
    // console.log('CriteriaField::componentWillUnmount: ', this.props.criteria);
    this.props.removeCriteriaComponents(this.props.criteria.id);
  };

  render() {
    let criteria = this.props.criteria;
    return (
      <div className="con-option">
        <div className="form-group">
          <input type="text" className="form-control" value={this.field_label} disabled={true}/>
        </div>
        <div className="form-group">
          <input type="text" className="form-control judgment" defaultValue={this.OPERATOR_DICT[criteria.operator]} disabled={true}/>
        </div>
        <div className="form-group">
          <input type="text"
                 className="form-control"
                 defaultValue={this.value_label}
                 disabled={true}/>
        </div>
        {(this.props.isPreview)? null: <i className="fa fa-times" aria-hidden="true" onClick={() => {
          // console.log('CriteriaField::onClick::removeCriteria: ', criteria.id);
          this.props.removeCriteria(this.props.index);
        }}/>}
      </div>
    );
  };

  displayTextFormatter(inputType, value, valueLabel) {
    if (isNull(value))
      return null;

    switch (inputType) {
      case 'number':
      case 'text':
      case 'date':
        return valueLabel;
      case 'refOption':
        return `[${valueLabel.join(' 或 ')}]`;
      default:
        return value;
    }
  };
};