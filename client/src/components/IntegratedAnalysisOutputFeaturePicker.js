import React from 'react';

export default class IntegratedAnalysisFeaturePicker extends React.PureComponent {
  render() {
    return (
      <div className="table_block feature">
        <h2>查詢條件</h2>
        <h3>第五步 挑選下載欄位</h3>
        <h4>挑選下載欄位</h4>
        <div className="btn-block text-left">
          <button type="submit" className="btn btn-sm btn-default">全選</button>
          <button type="submit" className="btn btn-sm btn-default">全不選</button>
        </div>
        <form className="addCondition">
          <ul>
            <li>
              <a href="#">客戶屬性 <i className="fa fa-plus" aria-hidden="true"/></a>
              <ul style={{display: 'none'}}>
                <li className="checkbox">
                  <label>
                    <input type="checkbox" value=""/>性別</label>
                </li>
                <li className="checkbox">
                  <label>
                    <input type="checkbox" value=""/>年紀</label>
                </li>
                <li className="checkbox">
                  <label>
                    <input type="checkbox" value=""/>生日月份</label>
                </li>
                <li className="checkbox">
                  <label>
                    <input type="checkbox" value=""/>學歷</label>
                </li>
                <li className="checkbox">
                  <label>
                    <input type="checkbox" value=""/>婚姻狀況</label>
                </li>
                <li className="checkbox">
                  <label>
                    <input type="checkbox" value=""/>建檔所</label>
                </li>
                <li className="checkbox">
                  <label>
                    <input type="checkbox" value=""/>建檔日期</label>
                </li>
              </ul>
            </li>
            <li>
              <a href="#">互動狀態<i className="fa fa-plus" aria-hidden="true"/></a>
              <ul style={{display: 'none'}}>
                <li className="checkbox">
                  <label>
                    <input type="checkbox" value=""/>LEXUS保有台數</label>
                </li>
                <li className="checkbox">
                  <label>
                    <input type="checkbox" value=""/>TOYOTA保有台數</label>
                </li>
                <li className="checkbox">
                  <label>
                    <input type="checkbox" value=""/>最近訪問日</label>
                </li>
              </ul>
            </li>
            <li>
              <a href="#">車輛基本資料<i className="fa fa-plus" aria-hidden="true"/></a>
              <ul style={{display: 'none'}}>
                <li className="checkbox">
                  <label>
                    <input type="checkbox" value=""/>車名</label>
                </li>
                <li className="checkbox">
                  <label>
                    <input type="checkbox" value=""/>販賣日期</label>
                </li>
                <li className="checkbox">
                  <label>
                    <input type="checkbox" value=""/>原始交車日</label>
                </li>
                <li className="checkbox">
                  <label>
                    <input type="checkbox" value=""/>年式</label>
                </li>
                <li className="checkbox">
                  <label>
                    <input type="checkbox" value=""/>車齡</label>
                </li>
                <li className="checkbox">
                  <label>
                    <input type="checkbox" value=""/>販賣經銷商</label>
                </li>
                <li className="checkbox">
                  <label>
                    <input type="checkbox" value=""/>販賣營業所</label>
                </li>
                <li className="checkbox">
                  <label>
                    <input type="checkbox" value=""/>販賣業代</label>
                </li>
              </ul>
            </li>
            <li>
              <a href="#">點數精品<i className="fa fa-plus" aria-hidden="true"/></a>
              <ul style={{display: 'none'}}>
                <li className="checkbox">
                  <label>
                    <input type="checkbox" value=""/>目前累積點數</label>
                </li>
              </ul>
            </li>
            <li>
              <a href="#">保險資料<i className="fa fa-plus" aria-hidden="true"/></a>
              <ul style={{display: 'none'}}>
                <li className="checkbox">
                  <label>
                    <input type="checkbox" value=""/>車體險到期日</label>
                </li>
                <li className="checkbox">
                  <label>
                    <input type="checkbox" value=""/>強制險到期日</label>
                </li>
                <li className="checkbox">
                  <label>
                    <input type="checkbox" value=""/>任意險到期日</label>
                </li>
                <li className="checkbox">
                  <label>
                    <input type="checkbox" value=""/>車體險[甲、乙、丙]</label>
                </li>
                <li className="checkbox">
                  <label>
                    <input type="checkbox" value=""/>強制險</label>
                </li>
                <li className="checkbox">
                  <label>
                    <input type="checkbox" value=""/>任意險</label>
                </li>
              </ul>
            </li>
            <li>
              <a href="#">車輛服務<i className="fa fa-plus" aria-hidden="true"/></a>
              <ul style={{display: 'none'}}>
                <li className="checkbox">
                  <label>
                    <input type="checkbox" value=""/>CR等級</label>
                </li>
                <li className="checkbox">
                  <label>
                    <input type="checkbox" value=""/>最近回廠日</label>
                </li>
                <li className="checkbox">
                  <label>
                    <input type="checkbox" value=""/>每年連續回廠定保</label>
                </li>
                <li className="checkbox">
                  <label>
                    <input type="checkbox" value=""/>每年連續回廠維修</label>
                </li>
                <li className="checkbox">
                  <label>
                    <input type="checkbox" value=""/>服務等級</label>
                </li>
              </ul>
            </li>
          </ul>
        </form>
        <h4>挑選下載明細資訊</h4>
        <div className="form-group">
          <label htmlFor="inputName" className="col-sm-3 control-label form-inline">明細時間區間</label>
          <div className="col-sm-7">
            <div className="form-inline">
              <input type="text" className="form-control" id="startDate" placeholder="2017/05/01"/> ~
                <input type="text" className="form-control" id="endDate" placeholder="2017/12/31"/>
            </div>
          </div>
        </div>
        <form className="addCondition">
          <ul>
            <li className="checkbox">
              <label>
                <input type="checkbox" value="" name="optradio"/>點數明細</label>
              兌換日期
            </li>
            <li className="checkbox">
              <label>
                <input type="checkbox" value="" name="optradio"/>CARES案件明細</label>
              案件建立日期
            </li>
            <li className="checkbox">
              <label>
                <input type="checkbox" value="" name="optradio"/>保險明細</label>
              要保書建立日期
            </li>
            <li className="checkbox">
              <label>
                <input type="checkbox" value="" name="optradio"/>預約明細</label>
              預約日期
            </li>
            <li className="checkbox">
              <label>
                <input type="checkbox" value="" name="optradio"/>訂單明細</label>
              建檔日期
            </li>
            <li className="checkbox">
              <label>
                <input type="checkbox" value="" name="optradio"/>勸誘明細</label>
              建檔日期
            </li>
            <li className="checkbox">
              <label>
                <input type="checkbox" value="" name="optradio"/>活動明細</label>
              建檔日期
            </li>
            <li className="checkbox">
              <label>
                <input type="checkbox" value="" name="optradio"/>NaN案件明細</label>
              建檔日期
            </li>
            <li className="checkbox">
              <label>
                <input type="checkbox" value="" name="optradio"/>估價單明細</label>
              估價日期
            </li>
            <li className="checkbox">
              <label>
                <input type="checkbox" value="" name="optradio"/>工作傳票明細</label>
              入廠日期
            </li>
          </ul>
        </form>
        <div className="btn-block center-block">
          <button type="submit" className="btn btn-lg btn-default">重新挑選客群</button>
          <button type="submit" className="btn btn-lg btn-default">下載資料</button>
        </div>
      </div>
    );
  };
};