import React from 'react';
import Loader from 'react-loader';
import {assign, reduce} from 'lodash';
import {nfcall, all} from 'q';
import CriteriaFieldPicker from './CriteriaFieldPicker';
import CriteriaComboBundle from './CriteriaComboBundle';
import CriteriaPreviewEmpty from './CriteriaPreviewEmpty';
import CriteriaComboBundleList from './CriteriaComboBundleList';
import {default as _test} from '../../test/preferred-criteria-test'

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
      _folding: ''
    }, options);
  };

  componentDidMount() {
    all([
      nfcall(getCriteria, this.options._folding),
      nfcall(getFoldingFieldData, this.options._folding)
    ]).spread((criteria, foldingFieldsInfo) => {
      this.criteria = criteria;
      this.foldingFields = foldingFieldsInfo.folding_fields;
      this.refOptions = foldingFieldsInfo.ref_options;
      this.refFields = getRefFields(this.foldingFields);
      this.refFolds = getRefFolders(this.foldingFields);
    }).finally(() => {
      this.setState({
        isLoaded: true
      });
    });
  };

  componentWillUpdate() {
    console.log('CriteriaBase::componentWillUpdate: ');
  };

  render() {
    const switchToEditMode = () => {
      this.setState({
        isPreview: false
      });
    };
    return (
      <Loader loaded={this.state.isLoaded}>
        {(() => {
          if (!this.criteria) {
            return (
              <div/>
            );
          } else if (this.state.isPreview && this.criteria.length === 0) {
            /** use PreferredTargetCriteriaPreviewEmpty to show empty preview data */
            return <CriteriaPreviewEmpty switchToEditMode={switchToEditMode}/>;
          } else {
            let className = 'condition';
            if (!this.state.isPreview ) {
              className = 'condition edit';
            }
            /**
             * DO NOT user functional component, which would enforce unmount/re-mount the component
             */
            return (
              <div className="table_block">
                {this.MainTitle()}
                {this.SubTitle()}
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
        {/*<!-- 新增條件組合 -->*/}
        <CriteriaFieldPicker foldingFields={this.foldingFields} refOptions={this.refOptions} ref={(e) => {
          this.fieldPicker = e;
        }}/>
      </Loader>
    );
  };

  MainTitle() {
    return <div/>;
  }

  SubTitle() {
    return <div/>;
  }

  /** Here, if criteria is empty, it must be edit mode,
   * coz empty data in preview mode would rendered and returned before.
   * */
  CriteriaNonEmptyContentRender() {
    const mapToProps = {
      foldingFields: this.foldingFields,
      refOptions: this.refOptions,
      refFields: this.refFields,
      refFolds: this.refFolds,
      addCriteriaField: (callback) => {
        console.log('CriteriaBase::addCriteriaField');
        this.fieldPicker.openModal(callback);
      }
    };

    return (
      <CriteriaComboBundleList
        {...mapToProps}
        isPreview={this.state.isPreview}
        criteria={this.criteria}
        ref={(e) => {
          this.criteriaWrapper = e;
        }}/>
    );
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
          <button type="button" className="btn btn-lg btn-default" onClick={() => {
            this.criteria = this.criteriaWrapper.getCriteria();
            console.log('CriteriaBase::CriteriaConfirm::onClick: ', this.criteria);
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
  //callback(null, _test.criteria[_folding]);
  callback(null, []);
};

const getFoldingFieldData = (_folding, callback) => {
  callback(null, {
    folding_fields: _test.fields[_folding],
    ref_options: _test.refs
  });
};

/**
 *
 * @param folds
 * @param callback
 * @example folds = [
 {
   type: 'field',
   id: 'last_visit_date',
   label: '最後訪問日',
   data_type: 'date',
   default_value: Date.now()
 }, {
        type: 'folder',
        id: 'customer_profile',
        label: '客戶屬性',
        fields: [{
          type: 'field',
          id: 'gender',
          label: '性別',
          data_type: 'refOption', //for cassandra
          ref: 'gender',
          default_value: 'M'
        }, {
          type: 'field',
          id: 'age',
          label: '年紀',
          data_type: 'number'
        }]
      }
 ]
 */
const getRefFields = (folders) => {
  return reduce(folders, (dictionary, data) => {
    if ('field' === data.type) {
      return Object.assign(dictionary, {
        [data.id]: {
          id: data.id,
          label: data.label,
          data_type: data.data_type,
          default_value: data.default_value,
          ref: data.ref
        }
      });
    } else if ('folder' === data.type) {
      return Object.assign(dictionary, getRefFields(data.fields));
    }
  }, {});
};

const getRefFolders = (folders) => {
  return reduce(folders, (dictionary, data) => {
    if ('folder' === data.type) {
      return assign(dictionary, {
        [data.id]: {
          id: data.id,
          label: data.label
        }
      }, getRefFolders(data.fields));
    } else {
      return dictionary;
    }
  }, {});
};