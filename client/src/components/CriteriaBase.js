import React from 'react';
import Loader from 'react-loader';
import {assign, reduce} from 'lodash';
import {nfcall, all} from 'q';
import CriteriaFieldPicker from './CriteriaFieldPicker';
import CriteriaPreview from './CriteriaPreview';
import CriteriaPreviewEmpty from './CriteriaPreviewEmpty';
import CriteriaEdit from './CriteriaEdit';
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
      _folding: '',
      main_title: '',
      sub_title: ''
    }, options);
  };

  getPreparingData(options) {
    all([
      nfcall(getCriteria, options._folding),
      nfcall(getFoldingFieldData, options._folding)
    ]).spread((criteria, foldingFieldsInfo) => {
      this.criteria = criteria;
      this.foldingFields = foldingFieldsInfo.folding_fields;
      this.refOptions = foldingFieldsInfo.ref_options;
      this.refFields = getRefFields(this.foldingFields);
      this.refFolds = getRefFolders(this.foldingFields);
    }).finally(() => {
      this.mapToProps = {
        foldingFields: this.foldingFields,
        refOptions: this.refOptions,
        refFields: this.refFields,
        refFolds: this.refFolds,
        moduleOptions: this.options,
        addCriteriaField: (callback) => {
          console.log('CriteriaBase::addCriteriaField');
          this.fieldPicker.openModal(callback);
        }
      };

      this.setState({
        isLoaded: true
      });
    });
  }

  componentWillMount() {
    this.getPreparingData(this.options);
  };

  componentWillUpdate() {
    console.log('CriteriaBase::componentWillUpdate: ');
  };

  render() {
    let ContentView = (!this.state.isLoaded)? null:
      (this.state.isPreview)?
        (this.criteria.length === 0)?
          <CriteriaPreviewEmpty {...this.mapToProps}
                                doEdit={() => {
                                  this.setState({
                                    isPreview: false
                                  });
                                }}/>:
          <CriteriaPreview {...this.mapToProps}
                           isPreview={this.state.isPreview}
                           criteria={this.criteria}
                           doEdit={() => {
                             this.setState({
                               isPreview: false
                             });
                           }}/>
        :
        <CriteriaEdit {...this.mapToProps}
                      isPreview={this.state.isPreview}
                      criteria={this.criteria}
                      doPreview={(criteria) => {
                        this.criteria = criteria;
                        this.setState({
                          isPreview: true
                        })
                      }}/>;

    return (
      <Loader loaded={this.state.isLoaded}>
        {ContentView}
        {/*<!-- 新增條件組合 -->*/}
        <CriteriaFieldPicker foldingFields={this.foldingFields} refOptions={this.refOptions} ref={(e) => {
          this.fieldPicker = e;
        }}/>
      </Loader>
    );
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