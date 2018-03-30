import React from 'react';
import PickerSingle from './PickerSingle'

export default class IntegratedCriteriaFeatureSetPicker extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      setId: null,
      setLabel: null
    };
  };

  componentWillMount() {
    this.openModal = (callback) => {
      this.responseCriteria = callback;
      this.setState({
        isOpen: true,
        selected: undefined
      });
      $('body').addClass('noscroll');
    };

    this.closeModal = () => {
      this.setState({
        isOpen: false,
        selected: undefined
      });
      $('body').removeClass('noscroll');
    };

    this.confirmCriteria = () => {
      this.responseCriteria({
        setId: this.state.selected.id,
        setLabel: this.state.selected.label,
        setCategory: this.state.selected.category,
        setCategoryLabel: this.state.selected.category_label
      });
      this.closeModal();
    };

    this.branchClickHandler = (node) => {
      // console.log('CriteriaTransactionSetPicker branchClickHandler: ', node);
    };

    this.tailClickHandler = (node) => {
      // console.log('CriteriaTransactionSetPicker tailClickHandler: ', node);
      this.setState({
        selected: node
      });
    };
  };

  render() {
    let display = (this.state.isOpen)? '': 'none';
    return (
      <div className="modal" style={{display: display}}>
        <div className="table_block">
          <h2>挑選指定明細資訊</h2>
          <div className="modalContent">
            <PickerSingle
              nodes={this.props.featureSets}
              selected={this.state.selected}
              branchClickHandler={this.branchClickHandler}
              tailClickHandler={this.tailClickHandler}/>
          </div>
          <div className="btn-block center-block">
            <button type="button" className="btn btn-lg btn-default" onClick={this.confirmCriteria}>確定</button>
            <button type="button" className="btn btn-lg btn-default" onClick={this.closeModal}>取消</button>
          </div>
        </div>
        <div className="overlay" onClick={this.closeModal}/>
      </div>
    );
  };
};
