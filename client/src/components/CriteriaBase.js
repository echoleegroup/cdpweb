import React from 'react';
import Loadable from 'react-loading-overlay';
import {assign, isEmpty} from 'lodash';
import ModalCriteriaSetter from './ModalCriteriaSetter';
import CriteriaComboBundle from './CriteriaComboBundle';
import CriteriaComboBundleList from './CriteriaComboBundleList';
import CriteriaBaseContainer from "./CriteriaBaseContainer";

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
      features: [],
      featureRefCodeMap: {},
      message_success: undefined,
      message_warning: undefined,
      message_error: undefined,
      criteria: props.criteria
    };

    this.ComponentModals = this.ComponentModals.bind(this);
    this.ComponentContentBody = this.ComponentContentBody.bind(this);
    this.ComponentCriteriaBundleContainer = this.ComponentCriteriaBundleContainer.bind(this);
    this.ComponentHeadline = this.ComponentHeadline.bind(this);
    this.ComponentSideHead = this.ComponentSideHead.bind(this);
    this.ComponentEmptyBody = this.ComponentEmptyBody.bind(this);
    this.ComponentPreviewControlButton = this.ComponentPreviewControlButton.bind(this);
    this.ComponentEditControlButton = this.ComponentEditControlButton.bind(this);
  };

  fetchPreparedData(callback) {
    callback({});
  };

  isReadyToLeave() {
    return this.state.isPreview;
  };

  validate(criteria) {
    return true;
  };

  componentWillMount() {
    //inner properties definition
    this.toPreview = () => {
      let criteria = this.criteriaWrapper.criteriaGathering();
      let valid = this.validate(criteria);
      if (valid) {
        // console.log('this.criteriaWrapper.criteriaGathering(): ', criteria);
        // this.props.changeViewHandler && this.props.changeViewHandler();
        this.setState({
          isPreview: true,
          message_success: undefined,
          message_warning: undefined,
          message_error: undefined,
          criteria: criteria
        }, () => {
          this.props.changeViewHandler(this.state.isPreview);
        });
      }
    };

    this.toEdit = () => {
      this.setState({
        isPreview: false
      }, () => {
        this.props.changeViewHandler(this.state.isPreview);
      });
    };

    this.toLoad = () => {
      this.setState({
        isLoaded: false
      });
    };

    this.getCriteria = () => {
      return this.state.criteria;
    };

    this.assignCriteria = (callback) => {
      this.masterModal.openModal(callback);
    };

    //init work
    this.fetchPreparedData(data => {
      this.setState(assign({
        isLoaded: true
      }, data));
    });
  };

  render() {
    let ComponentModals = this.ComponentModals;
    let mapToProps = {
      // isPreview: this.state.isPreview,
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
          message_success: this.state.message_success,
          message_warning: this.state.message_warning,
          message_error: this.state.message_error,
          ComponentCriteriaBody: this.ComponentContentBody,
          ComponentControlButton: this.ComponentPreviewControlButton
        });
      }
    } else {  //edit view
      mapToProps = assign(mapToProps, {
        styleClass: 'condition edit',
        message_success: this.state.message_success,
        message_warning: this.state.message_warning,
        message_error: this.state.message_error,
        ComponentCriteriaBody: this.ComponentContentBody,
        ComponentControlButton: this.ComponentEditControlButton
      });
    }

    return (
      <div>
        <CriteriaBaseContainer {...mapToProps}/>
        {/*<!-- 新增條件組合 -->*/}
        <ComponentModals/>
      </div>
    );
  };

  ComponentModals(props) {
    let mapToProps = {
      features: this.state.features,
      featureRefCodeMap: this.state.featureRefCodeMap,
      isLoaded: this.state.isLoaded
    };
    return (
      <ModalCriteriaSetter {...mapToProps} ref={(e) => {
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

  ComponentEmptyBody(props) {
    return (<p>無條件設定</p>);
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