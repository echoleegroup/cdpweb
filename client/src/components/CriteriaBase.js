import React from 'react';
import Loader from 'react-loader';
import {assign, reduce, isEmpty} from 'lodash';
import {nfcall, all} from 'q';
// import {fromJS} from 'immutable';
import CriteriaFieldPicker from './CriteriaFieldPicker';
import CriteriaView from './CriteriaView';
import CriteriaPreviewEmpty from './CriteriaPreviewEmpty';
import CriteriaAction from '../actions/criteria-action'
//import {default as _test} from '../../test/preferred-criteria-test'

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
      getCriteria(options._folding),
      getFoldingFieldData(options._folding)
    ]).spread((criteria, foldingFieldsInfo) => {
      this.criteria = criteria;
      this.foldingFields = foldingFieldsInfo.fields;
      this.refOptions = foldingFieldsInfo.fieldRefs;
      this.fieldDictionary = getFieldDictionary(this.foldingFields);
      this.folderDictionary = getFolderDictionary(this.foldingFields);
    }).fail((err) => {
      console.log('fetch necessary data failed: ', err);
    }).finally(() => {
      this.mapToProps = {
        foldingFields: this.foldingFields,
        moduleOptions: this.options,
        refOptions: this.refOptions,
        fieldDictionary: this.fieldDictionary,
        folderDictionary: this.folderDictionary,
        addCriteriaField: (callback) => {
          // console.log('CriteriaBase::addCriteriaField');
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

    this.PreviewControlButtonRender = () => {
      return (
        <button type="button" className="btn btn-lg btn-default" onClick={() => {
          this.setState({
            isPreview: false
          });
        }}>編輯條件</button>
      );
    };

    this.EditControlButtonRender = () => {
      return (
        <button type="button" className="btn btn-lg btn-default" onClick={() => {
          this.criteria = this.editView.getCriteria();
          // console.log('CriteriaBase::CriteriaConfirm::onClick: ', this.criteria);
          this.setState({
            isPreview: true
          })
        }}>完成編輯</button>
      );
    };
  };

  componentWillUpdate() {
    // console.log('CriteriaBase::componentWillUpdate: ');
  };

  render() {
    return (
      <Loader loaded={this.state.isLoaded}>
        {this.ContentView()}
        {/*<!-- 新增條件組合 -->*/}
        <CriteriaFieldPicker foldingFields={this.foldingFields} refOptions={this.refOptions} ref={(e) => {
          this.fieldPicker = e;
        }}/>
      </Loader>
    );
  };

  ContentView() {
    if (!this.state.isLoaded)
      return null;

    let props = {};
    if(this.state.isPreview) {
      if (isEmpty(this.criteria)) {
        return <CriteriaPreviewEmpty {...this.mapToProps}
                                     styleClass={'nocondition'}
                                     controlButtonRender={this.PreviewControlButtonRender}/>
      } else {
        Object.assign(props, {
          styleClass: 'condition',
          controlButtonRender: this.PreviewControlButtonRender
        });
      }
    } else {  //edit view
      Object.assign(props, {
        styleClass: 'condition edit',
        controlButtonRender: this.EditControlButtonRender,
        ref: (e) => {
          this.editView = e;
        }
      });
    }

    return <CriteriaView {...this.mapToProps}
                         {...props}
                         isPreview={this.state.isPreview}
                         criteria={this.criteria}/>
  }
};

const getCriteria = (_folding) => {
  return nfcall(CriteriaAction.getHistory, _folding);
  //return Q([]);
  //callback(null, _test.criteria[_folding]);
  //callback(null, []);
};

const getFoldingFieldData = (_folding, callback) => {
  return nfcall(CriteriaAction.getFieldsData, _folding).then((data) => {
    return {
      fields: data.fields,
      fieldRefs: data.fieldRefs
    };
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
const getFieldDictionary = (folders) => {
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
      return Object.assign(dictionary, getFieldDictionary(data.fields));
    }
  }, {});
};

const getFolderDictionary = (folders) => {
  return reduce(folders, (dictionary, data) => {
    if ('folder' === data.type) {
      return assign(dictionary, {
        [data.id]: {
          id: data.id,
          label: data.label
        }
      }, getFolderDictionary(data.fields));
    } else {
      return dictionary;
    }
  }, {});
};