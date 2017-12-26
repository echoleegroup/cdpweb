import React from 'react';
import Loader from 'react-loader';
import {assign, reduce} from 'lodash';
import {nfcall, all} from 'q';
import CriteriaComboBundle from './CriteriaComboBundle';
import CriteriaPreviewEmpty from './CriteriaPreviewEmpty';
import CriteriaComboBundleList from './CriteriaComboBundleList';
import {default as _test} from '../../test/preferred-criteria-test'

const _FOLDING = 'preferred_target';

/**
 * only control display mode between preview and edit. Never keep criteria data in state.
 * this.criteria is used to store current criteria, which response by subtree.
 */
export default class CriteriaBase extends React.PureComponent {
  constructor(props, options = {}) {
    super(props);
    this.state = {
      isPreview: true,
      isLoaded: false
    };
    //this.criteria = _test.criteria.preferred_target || [];
    //this.fields = _test.fields.preferred_target;
    //this.refOptions = _test.refs;
    //this.criteria = [];
    this.options = Object.assign({
      _title: null,
      _subTitle: null,
      _folding: ''
    }, options);
  };

  componentDidMount() {
    all([
      nfcall(getCriteria, this.options._folding),
      nfcall(getFoldingFields, this.options._folding),
      nfcall(getRefOptions),
    ]).spread((criteria, foldingFields, refOptions) => {
      this.criteria = criteria;
      this.foldingFields = foldingFields;
      this.refOptions = refOptions;
      this.refFields = getRefFields(foldingFields);
      this.refFolds = getRefFolds(foldingFields);
    }).finally(() => {
      this.setState({
        isLoaded: true
      });
    });
  };

  render() {
    return (
      <Loader loaded={this.state.isLoaded}>
        {(() => {
          if (!this.criteria) {
            return (
              <div/>
            );
          } else if (this.state.isPreview && this.criteria.length === 0) {
            /** use PreferredTargetCriteriaPreviewEmpty to show empty preview data */
            return <CriteriaPreviewEmpty/>;
          } else {
            let className = 'condition';
            if (!this.state.isPreview ) {
              className = 'condition edit';
            }
            let MainTitle = (this.options._title)? <h2>{this.options._title}</h2>: <div/>;
            let SubTitle = (this.options._subTitle)? <h3>{this.options._subTitle}</h3>: <div/>;
            /**
             * DO NOT user functional component, which would enforce unmount/re-mount the component
             */
            return (
              <div className="table_block">
                {MainTitle}
                {SubTitle}
                <div className={className}>
                  <form className="form-horizontal">
                    <div className="level form-inline">
                      {this.CriteriaNonEmptyContentRender()}
                    </div>
                  </form>
                </div>
                {this.ControlButtonRender()}
              </div>
            );
          }
        })()}
      </Loader>
    );
  };

  /** Here, if criteria is empty, it must be edit mode,
   * coz empty data in preview mode would rendered and returned before.
   * */
  CriteriaNonEmptyContentRender() {
    let mapToProps = {
      isPreview: this.state.isPreview,
      foldingFields: this.foldingFields,
      refOptions: this.refOptions,
      refFields: this.refFields,
      refFolds: this.refFolds,
      criteria: this.criteria
    };

    if (this.criteria.length === 0) {
      return (
        <CriteriaComboBundle
          {...mapToProps}
          ref={(e) => {
            this.criteriaWrapper = e;
          }}/>
      );
    } else {
      return (
        <CriteriaComboBundleList
          {...mapToProps}
          ref={(e) => {
            this.criteriaWrapper = e;
          }}/>
      );
    }
  }

  ControlButtonRender() {
    if (this.state.isPreview) {
      return (
        <div className="btn-block center-block">
          <button type="submit" className="btn btn-lg btn-default" onClick={() => {
            this.setState({
              isPreview: false
            });
          }}>編輯條件</button>
        </div>
      );
    } else {
      return (
        <div className="btn-block center-block">
          <button type="submit" className="btn btn-lg btn-default" onClick={() => {
            this.setState({
              isPreview: true
            });
          }}>完成編輯</button>
        </div>
      );
    }
  };
};

const getCriteria = (_folding, callback) => {
  callback(null, _test.criteria[_folding]);
};

const getFoldingFields = (_folding, callback) => {
  callback(null, _test.fields[_folding]);
};

const getRefOptions = (callback) => {
  callback(null, _test.refs);
};

/**
 *
 * @param folds
 * @param callback
 * @example folds = {
      _none: {
        fields: [{
          id: 'last_visit_date',
          label: '最後訪問日',
          data_type: 'date',
          default_value: Date.now()
        }]
      },
      customer_profile: {
        id: 'customer_profile',
        label: '客戶屬性',
        fields: [{
          id: 'gender',
          label: '性別',
          data_type: 'refOption', //for cassandra
          ref: 'gender',
          default_value: 'M'
        }, {
          id: 'age',
          label: '年紀',
          data_type: 'number'
        }]
      },
      interaction: {
        id: 'inter_action',
        label: '互動狀態',
        fields: [{
          id: 'lexus',
          label: 'LEXUS保有台數',
          data_type: 'number'
        }, {
          id: 'toyota',
          label: 'TOYOTA保有台數',
          data_type: 'number'
        }]
      }
    }
 */
const getRefFields = (folds) => {
  return reduce(folds, (fields, fold) => {
    return fields.concat(fold.fields);
  }, []).reduce((dictionary, field) => {
    return assign(dictionary, {
      [field.id]: {
        id: field.id,
        label: field.label,
        data_type: field.data_type,
        default_value: field.default_value,
        ref: field.ref
      }
    });
  }, {});
};

const getRefFolds = (folds) => {
  return reduce(folds, (dictionary, fold) => {
    if (fold) {
      return assign(dictionary, {
        [fold.id]: {
          id: fold.id,
          label: fold.label
        }
      });
    } else {
      return dictionary;
    }
  }, {});
};