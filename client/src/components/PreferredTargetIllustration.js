import React from 'react';

export default class PreferredTargetIllustration extends React.Component {
  render() {
    return (
      <div className="table_block table-responsive">
        <h2>客群資訊</h2>
        <h3>自定受眾</h3>
        <p>在(現有) 潛在客群中依條件挑出名單，條件可以自行設定</p>
        <br />
        <table className="table">
          <tbody>
          <tr>
            <td rowSpan="2">(現有) 潛在客群：</td>
            <td>已汰舊換新車主
              <i custom-flow="left" custom-tooltip="2016年有參與汰舊換新補助的車主，車主需為自然人，且舊車需為TOYOTA"/>
            </td>
          </tr>
          <tr>
            <td>94,076</td>
          </tr>
          <tr>
            <td>最後計算日期：</td>
            <td>2017/03/05 01:00:05</td>
          </tr>
          </tbody>
        </table>
      </div>
    );
  };
}