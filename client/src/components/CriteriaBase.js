import React from 'react';
import Loader from 'react-loader';
import {assign, reduce, isEmpty} from 'lodash';
//import {nfcall, all} from 'q';
import CriteriaAssignment from './CriteriaAssignment';
// import CriteriaView from './CriteriaView';
import CriteriaComboBundle from './CriteriaComboBundle';
import CriteriaComboBundleList from './CriteriaComboBundleList';
import CriteriaContentContainer from "./CriteriaContentContainer";
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
  };

  dataPreparing(props, _this, callback) {
    callback({});
  };

  isReadyToLeave() {
    return this.state.isPreview;
  };

  validate() {
    return true;
  };

  componentWillMount() {
    //inner properties definition
    this.toPreview = () => {
      let valid = this.validate();
      if (valid) {
        this.setState({
          isPreview: true,
          criteria: this.criteriaWrapper.criteriaGathering()
        });
      }
    };

    this.toEdit = () => {
      this.setState({
        isPreview: false
      });
    };

    this.criteriaGathering = () => {
      let criteria = this.state.criteria;
      if (!this.state.isPreview) {  //edit mode
        //fetch all criteria tree
        criteria = this.criteriaWrapper.criteriaGathering();
        //this.setState({criteria});
      }
      return criteria;
    };

    this.getCriteriaAssignmentProps = (props, state) => {
      return {
        mdId: props.params.mdId,
        batId: props.params.batId,
        features: state.features || [],
        featureRefCodeMap: state.featureRefCodeMap || {}
      };
    };

    //init work
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

  render() {
    if (!this.state.isLoaded) {
      return (<Loader loaded={false}/>);
    } else {
      return (
        <div>
          {this.ComponentContentView()}
          {/*<!-- 新增條件組合 -->*/}
          {this.ComponentModals()}
        </div>
      );
    }
  };

  ComponentModals() {
    let assignmentProps = this.getCriteriaAssignmentProps(this.props, this.state);
    return (
      <CriteriaAssignment {...assignmentProps} ref={(e) => {
        this.criteriaAssignment = e;
      }}/>
    );
  };

  ComponentContentView() {
    if (!this.state.isLoaded)
      return null;

    if(this.state.isPreview) {
      if (isEmpty(this.state.criteria)) {
        return this.ComponentPreviewEmpty();
      } else {
        return this.ComponentPreviewContent();
      }
    } else {  //edit view
      return this.ComponentEditContent();
    }
  };

  ComponentHeadline() {
    return <h2>{this.headlineText()}</h2>
  };

  ComponentSideHead() {
    return <h3>{this.subheadText()}</h3>;
  };

  headlineText() {
    return '';
  };

  subheadText() {
    return '';
  };

  ComponentContentBody() {
    const assignCriteria = (callback) => {
      // console.log('CriteriaBase::assignCriteria');
      this.criteriaAssignment.openModal(callback);
    };

    return (
      <form className="form-horizontal">
        <div className="level form-inline">
          <CriteriaComboBundleList
            isPreview={this.state.isPreview}
            criteria={this.state.criteria}
            assignCriteria={assignCriteria}
            ComponentCriteriaBundleContainer={this.ComponentCriteriaBundleContainer}
            ref={(e) => {
              this.criteriaWrapper = e;
            }}/>
        </div>
      </form>
    );
  };

  ComponentCriteriaBundleContainer(props) {
    return (
      <CriteriaComboBundle {...props}/>
    );
  };

  ComponentPreviewEmpty() {
    const Body = <p>無條件設定</p>;
    let props = {
      styleClass: 'nocondition',
      ComponentHeadline: this.ComponentHeadline(),
      ComponentSideHead: this.ComponentSideHead(),
      ComponentCriteriaBody: Body,
      ComponentControlButton: this.ComponentPreviewControlButton()
    };

    return <CriteriaContentContainer {...props}/>
  };

  ComponentEditContent() {
    let props = {
      styleClass: 'condition edit',
      ComponentHeadline: this.ComponentHeadline(),
      ComponentSideHead: this.ComponentSideHead(),
      ComponentCriteriaBody: this.ComponentContentBody(),
      ComponentControlButton: this.ComponentEditControlButton(),
      assignCriteria: (callback) => {
        // console.log('CriteriaBase::assignCriteria');
        this.criteriaAssignment.openModal(callback);
      }
    };
    return <CriteriaContentContainer {...props}/>
  };

  ComponentPreviewContent() {
    let props = {
      styleClass: 'condition',
      ComponentHeadline: this.ComponentHeadline(),
      ComponentSideHead: this.ComponentSideHead(),
      ComponentCriteriaBody: this.ComponentContentBody(),
      ComponentControlButton: this.ComponentPreviewControlButton(),
      assignCriteria: (callback) => {
        // console.log('CriteriaBase::assignCriteria');
        this.criteriaAssignment.openModal(callback);
      }
    };
    return <CriteriaContentContainer {...props}/>
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