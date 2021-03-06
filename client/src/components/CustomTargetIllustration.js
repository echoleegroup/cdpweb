import React from 'react';
import Loadable from 'react-loading-overlay';
import {getPotentialTargetSummary} from '../actions/model-action';

export default class CustomTargetIllustration extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      isLoaded: false,
      popName: '',
      popDesc: '',
      categCount: '',
      lastTimeBatch: ''
    };
  };

  componentWillMount() {
    getPotentialTargetSummary(
      this.props.params.mdId,
      this.props.params.batId,
      ({popName = '', popDesc = '', categCount = 0, lastTimeBatch = ''}) => {
        this.setState({
          isLoaded: true,
          popName: popName,
          popDesc: popDesc,
          categCount: categCount,
          lastTimeBatch: lastTimeBatch
        });
      });
  };

  render() {
    return (
      <div className="table_block table-responsive">
        <h2>客群資訊</h2>
        <h3>自定受眾</h3>
        <p>在(現有) 潛在客群中依條件挑出名單，條件可以自行設定</p>
        <br />
        <Loadable active={!this.state.isLoaded} spinner>
          <table className="table">
            <tbody>
            <tr>
              <td rowSpan="2">(現有) 潛在客群：</td>
              <td>{this.state.popName}
                <i flow="left" tooltip={this.state.popDesc}/>
              </td>
            </tr>
            <tr>
              <td>{this.state.categCount}</td>
            </tr>
            <tr>
              <td>最後計算日期：</td>
              <td>{this.state.lastTimeBatch}</td>
            </tr>
            </tbody>
          </table>
        </Loadable>
      </div>
    );
  };
}