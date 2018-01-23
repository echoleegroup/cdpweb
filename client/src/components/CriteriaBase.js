import React from 'react';
import Loader from 'react-loader';
import {assign, reduce, isEmpty} from 'lodash';
//import {nfcall, all} from 'q';
import CriteriaSetter from './CriteriaSetter';
import CriteriaView from './CriteriaView';
import CriteriaPreviewEmpty from './CriteriaPreviewEmpty';
//import CustomFilterAction from '../actions/criteria-action'
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

  dataPreparing(props, _this, callback) {
    callback();
    // this.getFoldingFieldData(assign({}, this.props.params, this.options), data => {
    //   let foldingFields = data.fields;
    //   let fieldRefs = data.fieldRefs;
    //   this.mapToProps = {
    //     foldingFields: foldingFields,
    //     displayOptions: {
    //       main_title: this.getMainTitle(),
    //       sub_title: this.getSubTitle()
    //     },
    //     refOptions: fieldRefs,
    //     fieldDictionary: getFieldDictionary(foldingFields),
    //     folderDictionary: getFolderDictionary(foldingFields),
    //     addCriteriaField: (callback) => {
    //       // console.log('CriteriaBase::addCriteriaField');
    //       this.fieldPicker.openModal(callback);
    //     }
    //   };
    //
    //   this.setState({
    //     isLoaded: true
    //   });
    // });
  };

  componentWillMount() {
    this.toPreview = () => {
      this.setState({
        isPreview: true,
        criteria: this.editView.criteriaGathering()
      });
    };

    this.toEdit = () => {
      this.setState({
        isPreview: false
      });
    };

    this.criteriaGathering = () => {
      let criteria = this.state.criteria;
      if (this.editView) {  //edit mode
        //fetch all criteria tree
        criteria = this.editView.criteriaGathering();
        this.setState({criteria});
      }
      return criteria;
    };

    this.mapToProps = {
      displayOptions: {
        main_title: this.getMainTitle(),
        sub_title: this.getSubTitle()
      },
      addCriteriaField: (callback) => {
        // console.log('CriteriaBase::addCriteriaField');
        this.fieldPicker.openModal(callback);
      }
    };

    this.dataPreparing(this.props, this, (data) => {
      this.setState(assign({
        isLoaded: true
      }, data));
    });
  };

  componentWillUpdate() {
    console.log('CriteriaBase::componentWillUpdate: ');
  };

  componentWillUnmount() {
    console.log('CriteriaBase::componentWillUnmount: ');
  };

  getPickerProps(props, state) {
    return {
      mdId: props.params.mdId,
      batId: props.params.batId,
      features: [],
      featureRefCodeMap: {}
    };
  };

  render() {
    let pickerProps = this.getPickerProps(this.props, this.state);
    if (!this.state.isLoaded) {
      return (<Loader loaded={false}/>);
    } else {
      return (
        <div>
          {this.ComponentContentView()}
          {/*<!-- 新增條件組合 -->*/}
          <CriteriaSetter {...pickerProps} ref={(e) => {
            this.fieldPicker = e;
          }}/>
        </div>
      );
    }
  };

  ComponentContentView() {
    if (!this.state.isLoaded)
      return null;

    let props = {};
    if(this.state.isPreview) {
      if (isEmpty(this.state.criteria)) {
        return <CriteriaPreviewEmpty {...this.mapToProps}
                                     styleClass={'nocondition'}
                                     controlButtonRender={this.ComponentPreviewControlButton.bind(this)}/>
      } else {
        assign(props, {
          styleClass: 'condition',
          controlButtonRender: this.ComponentPreviewControlButton.bind(this)
        });
      }
    } else {  //edit view
      assign(props, {
        styleClass: 'condition edit',
        controlButtonRender: this.ComponentEditControlButton.bind(this),
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

  ComponentPreviewControlButton() {
    return (
      <div className="btn-block center-block">
        <button type="button" className="btn btn-lg btn-default" onClick={this.toEdit}>編輯條件</button>
      </div>
    );
  };

  ComponentEditControlButton() {
    return (
      <div className="btn-block center-block">
        <button type="button" className="btn btn-lg btn-default" onClick={this.toPreview}>完成編輯</button>
      </div>
    );
  };

  // getHistory(options, callback) {
  //   callback(null, []);
  // };

  // getFoldingFieldData(options, callback) {
  //   callback({
  //     fields: [],
  //     fieldRefs: {}
  //   });
  // };
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
// const getFieldDictionary = (folders) => {
//   return reduce(folders, (dictionary, data) => {
//     if ('field' === data.type) {
//       return assign(dictionary, {
//         [data.id]: {
//           id: data.id,
//           label: data.label,
//           data_type: data.data_type,
//           default_value: data.default_value,
//           ref: data.ref
//         }
//       });
//     } else if ('folder' === data.type) {
//       return assign(dictionary, getFieldDictionary(data.fields));
//     }
//   }, {});
// };
//
// const getFolderDictionary = (folders) => {
//   return reduce(folders, (dictionary, data) => {
//     if ('folder' === data.type) {
//       return assign(dictionary, {
//         [data.id]: {
//           id: data.id,
//           label: data.label
//         }
//       }, getFolderDictionary(data.fields));
//     } else {
//       return dictionary;
//     }
//   }, {});
// };