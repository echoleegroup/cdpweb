import React from 'react';
import Loader from 'react-loader';
import {assign, reduce, isEmpty} from 'lodash';
//import {nfcall, all} from 'q';
import Rx from 'rxjs';
import CriteriaFieldPicker from './CriteriaFieldPicker';
import CriteriaView from './CriteriaView';
import CriteriaPreviewEmpty from './CriteriaPreviewEmpty';
//import CriteriaAction from '../actions/criteria-action'
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
      isLoaded: false,
      criteria: props.criteria || []
    };
    //this.criteria = _test.criteria.preferred_target || [];
    //this.fields = _test.fields.preferred_target;
    //this.refOptions = _test.refs;
    //this.criteria = [];
    this.options = assign({}, options);
    //this.criteria = props.criteria || [];
  };

  getPreparingData() {
    this.getFoldingFieldData(assign({}, this.props.params, this.options), data => {
      let foldingFields = data.fields;
      let fieldRefs = data.fieldRefs;
      this.mapToProps = {
        foldingFields: foldingFields,
        displayOptions: {
          main_title: this.getMainTitle(),
          sub_title: this.getSubTitle()
        },
        refOptions: fieldRefs,
        fieldDictionary: getFieldDictionary(foldingFields),
        folderDictionary: getFolderDictionary(foldingFields),
        addCriteriaField: (callback) => {
          // console.log('CriteriaBase::addCriteriaField');
          this.fieldPicker.openModal(callback);
        }
      };

      this.setState({
        isLoaded: true
      });
    });
  };

  componentWillMount() {
    this.getPreparingData();

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
          // this.criteria = this.editView.getCriteria();
          // console.log('CriteriaBase::CriteriaConfirm::onClick: ', this.criteria);
          this.setState({
            isPreview: true,
            criteria: this.editView.getCriteria()
          });
        }}>完成編輯</button>
      );
    };

    this.getCriteria = () => {
      let criteria = this.state.criteria;
      if (this.editView) {  //edit mode
        //fetch all criteria tree
        criteria = this.editView.getCriteria();
        this.setState({criteria});
      }
      return criteria;
    };
  };

  componentWillUpdate() {
    console.log('CriteriaBase::componentWillUpdate: ');
  };

  componentWillUnmount() {
    console.log('CriteriaBase::componentWillUnmount: ');
  };

  render() {
    if (!this.state.isLoaded) {
      return (<Loader loaded={false}/>);
    } else {
      return (
        <div>
          {this.ContentView()}
          {/*<!-- 新增條件組合 -->*/}
          <CriteriaFieldPicker foldingFields={this.mapToProps.foldingFields} refOptions={this.mapToProps.refOptions} ref={(e) => {
            this.fieldPicker = e;
          }}/>
        </div>
      );
    }
  };

  ContentView() {
    if (!this.state.isLoaded)
      return null;

    let props = {};
    if(this.state.isPreview) {
      if (isEmpty(this.state.criteria)) {
        return <CriteriaPreviewEmpty {...this.mapToProps}
                                     styleClass={'nocondition'}
                                     controlButtonRender={this.PreviewControlButtonRender}/>
      } else {
        assign(props, {
          styleClass: 'condition',
          controlButtonRender: this.PreviewControlButtonRender
        });
      }
    } else {  //edit view
      assign(props, {
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
                         criteria={this.state.criteria}/>
  };

  getMainTitle() {
    return '';
  };

  getSubTitle() {
    return '';
  };

  // getHistory(options, callback) {
  //   callback(null, []);
  // };

  getFoldingFieldData(options, callback) {
    callback({
      fields: [],
      fieldRefs: {}
    });
  };
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
      return assign(dictionary, {
        [data.id]: {
          id: data.id,
          label: data.label,
          data_type: data.data_type,
          default_value: data.default_value,
          ref: data.ref
        }
      });
    } else if ('folder' === data.type) {
      return assign(dictionary, getFieldDictionary(data.fields));
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