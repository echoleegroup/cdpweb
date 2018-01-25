import React from 'react';
import Loader from 'react-loader';
import Picker from './Picker'

export default class IntegratedAnalysisFeatureSetPicker extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      setId: null
    };
  };

  componentWillMount() {
    this.openModal = (callback) => {
      // console.log('CriteriaAssignment::openModal');
      this.responseCriteria = callback;
      this.setState({
        isOpen: true,
        setId: null
      });
      $('body').addClass('noscroll');
    };

    this.closeModal = () => {
      this.setState({
        isOpen: false,
        setId: null
      });
      $('body').removeClass('noscroll');
    };

    this.confirmCriteria = () => {
      this.responseCriteria(this.state.setId);
      this.closeModal();
    };

    this.branchClickHandler = (node) => {};

    this.tailClickHandler = (node) => {
      this.setState({
        setId: node.id
      });
    };
  };

  render() {
    let display = (this.state.isOpen)? '': 'none';
    return (
      <div className="modal" style={{display: display}}>
        <Loader loaded={this.state.isLoaded}>
          <div className="table_block">
            <h2>挑選指定明細資訊</h2>
            <Picker nodes={this.props.features}
                    branchClickHandler={this.branchClickHandler}
                    tailClickHandler={this.tailClickHandler}/>
            <div className="btn-block center-block">
              <button type="button" className="btn btn-lg btn-default" onClick={this.confirmCriteria}>確定</button>
              <button type="button" className="btn btn-lg btn-default" onClick={this.closeModal}>取消</button>
            </div>
          </div>
          <div className="overlay" onClick={this.closeModal}/>
        </Loader>
      </div>
    );
  };
};
