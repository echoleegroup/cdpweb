import React from 'react';

export default class CriteriaDetailRefPicker extends React.PureComponent {
  render() {
    return (
      <div className="modal" style={{display: 'none'}}>
        <div className="table_block">
          <h2>挑選指定明細資訊</h2>
          <form className="addCondition">
            <ul>
              <li className="radio">
                <label>
                  <input type="radio" value="" name="optradio"/>點數明細</label>
              </li>
              <li className="radio">
                <label>
                  <input type="radio" value="" name="optradio"/>CARES案件明細</label>
              </li>
              <li className="radio">
                <label>
                  <input type="radio" value="" name="optradio"/>保險明細</label>
              </li>
              <li className="radio">
                <label>
                  <input type="radio" value="" name="optradio"/>預約明細</label>
              </li>
              <li className="radio">
                <label>
                  <input type="radio" value="" name="optradio"/>訂單明細</label>
              </li>
              <li className="radio">
                <label>
                  <input type="radio" value="" name="optradio"/>勸誘明細</label>
              </li>
              <li className="radio">
                <label>
                  <input type="radio" value="" name="optradio"/>活動明細</label>
              </li>
              <li className="radio">
                <label>
                  <input type="radio" value="" name="optradio"/>NaN案件明細</label>
              </li>
              <li className="radio">
                <label>
                  <input type="radio" value="" name="optradio"/>估價單明細</label>
              </li>
              <li className="radio">
                <label>
                  <input type="radio" value="" name="optradio"/>工作傳票明細</label>
              </li>
            </ul>
          </form>
          <div className="btn-block center-block">
            <button type="submit" className="btn btn-lg btn-default">確定</button>
            <button type="submit" className="btn btn-lg btn-default">取消</button>
          </div>
        </div>
        <div className="overlay"/>
      </div>
    );
  };
}