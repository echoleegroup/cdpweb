import React from 'react';
import Loader from 'react-loader';
import {assign, reduce, isEmpty} from 'lodash';
//import {nfcall, all} from 'q';
import CriteriaAssignment from './CriteriaAssignment';
// import CriteriaView from './CriteriaView';
import CriteriaComboBundle from './CriteriaComboBundle';
import CriteriaComboBundleList from './CriteriaComboBundleList';
import CriteriaBaseContainer from "./CriteriaBaseContainer";
//import CustomFilterAction from '../actions/criteria-action'
//import {default as _test} from '../../test/preferred-criteria-test'

/**
 * only control display mode between preview and edit. Never keep criteria data in state.
 * this.criteria is used to store current criteria, which response by subtree.
 */
export default class CriteriaBase extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      isPreview: true,
      isLoaded: false,
      criteria: props.criteria || []
    };
    this.ComponentModals = this.ComponentModals.bind(this);
    this.ComponentContentBody = this.ComponentContentBody.bind(this);
    this.ComponentCriteriaBundleContainer = this.ComponentCriteriaBundleContainer.bind(this);
    this.ComponentHeadline = this.ComponentHeadline.bind(this);
    this.ComponentSideHead = this.ComponentSideHead.bind(this);
    this.ComponentEmptyBody = this.ComponentEmptyBody.bind(this);
    this.ComponentPreviewEmpty = this.ComponentPreviewEmpty.bind(this);
    this.ComponentPreviewContent = this.ComponentPreviewContent.bind(this);
    this.ComponentEditContent = this.ComponentEditContent.bind(this);
    this.ComponentPreviewControlButton = this.ComponentPreviewControlButton.bind(this);
    this.ComponentEditControlButton = this.ComponentEditControlButton.bind(this);

    //this.criteria = _test.criteria.custom_target || [];
    //this.fields = _test.fields.custom_target;
    //this.refOptions = _test.refs;
  };

  fetchPreparedData(props, _this, callback) {
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
        let criteria = this.criteriaWrapper.criteriaGathering();
        // console.log('this.criteriaWrapper.criteriaGathering(): ', criteria);
        this.setState({
          isPreview: true,
          criteria: criteria
        });
      }
    };

    this.toEdit = () => {
      this.setState({
        isPreview: false
      });
    };

    this.toLoad = () => {
      this.setState({
        isLoaded: false
      });
    };

    this.getCriteria = () => {
      // let criteria = this.state.criteria;
      // if (!this.state.isPreview) {  //edit mode
      //   //fetch all criteria tree
      //   criteria = this.criteriaWrapper.criteriaGathering();
      // }
      // return criteria;
      return this.state.criteria;
    };

    this.assignCriteria = (callback) => {
      this.masterModal.openModal(callback);
    };

    //init work
    this.fetchPreparedData(this.props, this, (data) => {
      this.setState(assign({
        isLoaded: true
      }, data));
    });
  };

  // componentWillUnmount() {
  //   console.log('CriteriaBase::componentWillUnmount: ');
  // };

  render() {
    let ComponentModals = this.ComponentModals;
    let mapToProps = {
      ComponentHeadline: this.ComponentHeadline,
      ComponentSideHead: this.ComponentSideHead,
      ComponentCriteriaBundleContainer: this.ComponentCriteriaBundleContainer
    };
    if (this.state.isPreview) {
      if (isEmpty(this.state.criteria)) {
        mapToProps = assign(mapToProps, {
          styleClass: 'nocondition',
          ComponentCriteriaBody: this.ComponentEmptyBody,
          ComponentControlButton: this.ComponentPreviewControlButton,
        });
      } else {
        mapToProps = assign(mapToProps, {
          styleClass: 'condition',
          ComponentCriteriaBody: this.ComponentContentBody,
          ComponentControlButton: this.ComponentPreviewControlButton
        });
      }
    } else {  //edit view
      mapToProps = assign(mapToProps, {
        styleClass: 'condition edit',
        ComponentCriteriaBody: this.ComponentContentBody,
        ComponentControlButton: this.ComponentEditControlButton
      });
    }

    return (
      <Loader loaded={this.state.isLoaded}>
        <CriteriaBaseContainer {...mapToProps}/>
        {/*<!-- 新增條件組合 -->*/}
        <ComponentModals {...this.state}/>
      </Loader>
    );
  };

  ComponentModals(props) {
    let mapToProps = {
      features: props.features || [],
      featureRefCodeMap: props.featureRefCodeMap || {}
    };
    return (
      <CriteriaAssignment {...mapToProps} ref={(e) => {
        this.masterModal = e;
      }}/>
    );
  };

  ComponentHeadline(props) {
    return <h2>{this.headlineText()}</h2>
  };

  ComponentSideHead(props) {
    return <h3>{this.subheadText()}</h3>;
  };

  headlineText() {
    return '';
  };

  subheadText() {
    return '';
  };

  ComponentContentBody(props) {
    return (
      <div className="level form-inline">
        <CriteriaComboBundleList
          isPreview={this.state.isPreview}
          criteria={this.state.criteria}
          assignCriteria={this.assignCriteria}
          ComponentCriteriaBundleContainer={props.ComponentCriteriaBundleContainer}
          ref={e => {
            this.criteriaWrapper = e;
          }}/>
      </div>
    );
  };

  ComponentCriteriaBundleContainer(props) {
    return <CriteriaComboBundle {...props}/>;
  };

  ComponentPreviewEmpty(props) {
    let mapToProps = {
      styleClass: 'nocondition',
      ComponentHeadline: this.ComponentHeadline,
      ComponentSideHead: this.ComponentSideHead,
      ComponentCriteriaBody: this.ComponentEmptyBody,
      ComponentControlButton: this.ComponentPreviewControlButton,
      ComponentCriteriaBundleContainer: this.ComponentCriteriaBundleContainer
    };

    return <CriteriaBaseContainer {...mapToProps}/>
  };

  ComponentEmptyBody(props) {
    return (<p>無條件設定</p>);
  };

  ComponentEditContent(props) {
    let mapToProps = {
      styleClass: 'condition edit',
      ComponentHeadline: this.ComponentHeadline,
      ComponentSideHead: this.ComponentSideHead,
      ComponentCriteriaBody: this.ComponentContentBody,
      ComponentControlButton: this.ComponentEditControlButton,
      ComponentCriteriaBundleContainer: this.ComponentCriteriaBundleContainer
    };
    return <CriteriaBaseContainer {...mapToProps}/>
  };

  ComponentPreviewContent(props) {
    let mapToProps = {
      styleClass: 'condition',
      ComponentHeadline: this.ComponentHeadline,
      ComponentSideHead: this.ComponentSideHead,
      ComponentCriteriaBody: this.ComponentContentBody,
      ComponentControlButton: this.ComponentPreviewControlButton,
      ComponentCriteriaBundleContainer: this.ComponentCriteriaBundleContainer
    };
    return <CriteriaBaseContainer {...mapToProps}/>
  };

  ComponentPreviewControlButton(props) {
    return (
      <div className="btn-block center-block">
        <button type="button" className="btn btn-lg btn-default" onClick={this.toEdit}>編輯條件</button>
      </div>
    );
  };

  ComponentEditControlButton(props) {
    return (
      <div className="btn-block center-block">
        <button type="button" className="btn btn-lg btn-default" onClick={this.toPreview}>完成編輯</button>
      </div>
    );
  };

};