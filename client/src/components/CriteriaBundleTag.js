import React from 'react';
import {map} from 'lodash';
import {List} from 'immutable';
import {getTagCriteriaFeatures} from "../actions/integrated-analysis-action";
import CriteriaBundleTransaction from "./CriteriaBundleTransaction";
import ModalTagPicker from "./ModalTagPicker";

const OPERATOR_OPTIONS =  {
  or: '任一'
};
export default class CriteriaBundleTag extends CriteriaBundleTransaction {
  constructor(props) {
    super(props);
    this.OPERATOR_OPTIONS = OPERATOR_OPTIONS;
    this.BUNDLE_TYPE_LABEL = '標籤條件';
  };

  componentWillMount() {
    super.componentWillMount();

    this.insertCriteriaState = (tagList) => {
      // console.log('CriteriaBundleTag:insertCriteriaState: ', tagList);
      this.setState(prevState => ({
        properties: prevState.properties.set('criteria', List(tagList))
      }));
    };

    this.fetchFeatureData = ({keyword}, callback) => {
      getTagCriteriaFeatures(
        this.getPropertyState('ref'), keyword, callback);
    };
  };

  fetchPreparedData() {
    //do nothing
  };

  ComponentCustomized(props) {
    let mapToProps = {
      title: this.getPropertyState('ref_label'),
      dataHandler: this.fetchFeatureData,
      selected: map(this.state.properties.get('criteria').toJS(), 'value')
    };
    return (
      <ModalTagPicker {...mapToProps} ref={(e) => {
        this.slaveModal = e;
      }}/>
    );
  };

  ComponentChildCriteriaBlock(props) {
    return (
      <div className="level form-inline">
        <div className="con-option">
          <div className="tag customize">
            <ul>
              {this.state.properties.get('criteria').map((_criteria, index) => {
                return this.ComponentChildCriteria(_criteria, index);
              })}
            </ul>
          </div>
        </div>
      </div>
    );
  };

  ComponentButtonInsertCriteria(props) {
    if (!props.isPreview) {
      return (
        <div className="add_condition">{/*<!-- 加條件 條件組合 -->*/}
          <button type="button" className="btn btn-warning" onClick={props.addCriteriaClickHandler}>
            <i className="fa fa-plus" aria-hidden="true"/>加標籤
          </button>
        </div>
      );
    } else {
      return null;
    }
  };
};