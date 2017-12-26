import React from 'react';

export default class CriteriaFieldPicker extends React.PureComponent {
  render() {
    return (
      <!-- 新增條件組合 -->
      <div className="modal" style={{display: 'none'}}>
        <div className="table_block">
          <h2>新增條件</h2>
          <div className="row">
            <div className="col-md-6">
              <h3>挑選欄位條件</h3>
              <form className="addCondition">
                <ul>
                  <li>
                    <a href="#" ref={(e) => {}} onClick={(e) => {}}>點數明細<i className="fa fa-plus" aria-hidden="true"/></a>
                    <ul style={{display: 'none'}}>
                      <li className="radio">
                        <label>
                          <input type="radio" value="" name="optradio"/>兌換日期</label>
                      </li>
                      <li className="radio">
                        <label>
                          <input type="radio" value="" name="optradio"/>兌換金額</label>
                      </li>
                      <li className="radio">
                        <label>
                          <input type="radio" value="" name="optradio"/>兌換點數</label>
                      </li>
                    </ul>
                  </li>
                </ul>
              </form>
            </div>
            <div className="col-md-2">
              <h3>條件</h3>
              <select className="form-control judgment">
                <option>=</option>
                <option>≠</option>
                <option>></option>
                <option>>=</option>
                <option>{'<='}</option>
                <option>為</option>
                <option>不為</option>
              </select>
            </div>
            <div className="col-md-4">
              <h3>條件值</h3>
              <!-- 數值 -->
              <input type="text" className="form-control " id="inputName" value="" placeholder=""/>
            </div>
          </div>
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