import React from 'react';
import {List} from 'immutable';

export default class PreferredTargetCriteriaPreview extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      criteria: this.props.criteria
    };
  };

  render() {
    if(this.state.criteria.size === 0) {
      return (
        <div className="nocondition">{/*<!-- 無條件設定 -->*/}
          <p>無條件設定</p>
        </div>
      );
    } else {
      return (
        <div className="condition">{/*<!-- 條件設定 預覽狀態-->*/}
          <form className="form-horizontal">
            <div className="level form-inline">
              {/*<!-- head -->*/}
              <div className="head">
                以下條件
                <select className="form-control" disabled="">
                  <option>任一</option>
                  <option>全部</option>
                </select>成立
              </div>
              {/*<!-- 第二層 -->*/}
              <div className="level form-inline">
                <div className="con-option">
                  <div className="form-group">
                    <input type="text" className="form-control" id="" value="最近訪問日" disabled=""/>
                  </div>
                  <div className="form-group">
                    <input type="text" className="form-control judgment" id="" value=">" disabled=""/>
                  </div>
                  <div className="form-group">
                    <input type="text" className="form-control" id="" value="2017/03/01" disabled=""/>
                  </div>
                </div>
                {/*<!-- head -->*/}
                <div className="head">
                  以下條件
                  <select className="form-control" disabled="">
                    <option>任一</option>
                    <option>全部</option>
                  </select>成立
                </div>
                {/*<!-- 第三層 -->*/}
                <div className="level form-inline">
                  <div className="con-option">
                    <div className="form-group">
                      <input type="text" className="form-control" id="" value="年紀" disabled=""/>
                    </div>
                    <div className="form-group">
                      <input type="text" className="form-control judgment" id="" value=">" disabled=""/>
                    </div>
                    <div className="form-group">
                      <input type="text" className="form-control" id="" value="28" disabled=""/>
                    </div>
                  </div>
                  <div className="con-option">
                    <div className="form-group">
                      <input type="text" className="form-control" id="" value="年紀" disabled=""/>
                    </div>
                    <div className="form-group">
                      <input type="text" className="form-control judgment" id="" value=">" disabled=""/>
                    </div>
                    <div className="form-group">
                      <input type="text" className="form-control" id="" value="28" disabled=""/>
                    </div>
                  </div>
                  <div className="con-option">
                    <div className="form-group">
                      <input type="text" className="form-control" id="" value="年紀" disabled=""/>
                    </div>
                    <div className="form-group">
                      <input type="text" className="form-control judgment" id="" value=">" disabled=""/>
                    </div>
                    <div className="form-group">
                      <input type="text" className="form-control" id="" value="28" disabled=""/>
                    </div>
                  </div>
                </div>
              </div>
              {/*<!-- 第二層 -->*/}
              <div className="level form-inline">
                {/*<!-- head -->*/}
                <div className="head">
                  以下條件
                  <select className="form-control" disabled="">
                    <option>任一</option>
                    <option>全部</option>
                  </select>成立
                </div>
                {/*<!-- 第三層 -->*/}
                <div className="level form-inline">
                  <div className="con-option">
                    <div className="form-group">
                      <input type="text" className="form-control" id="" value="年紀" disabled=""/>
                    </div>
                    <div className="form-group">
                      <input type="text" className="form-control judgment" id="" value=">" disabled=""/>
                    </div>
                    <div className="form-group">
                      <input type="text" className="form-control" id="" value="28" disabled=""/>
                    </div>
                  </div>
                  <div className="con-option">
                    <div className="form-group">
                      <input type="text" className="form-control" id="" value="年紀" disabled=""/>
                    </div>
                    <div className="form-group">
                      <input type="text" className="form-control judgment" id="" value=">" disabled=""/>
                    </div>
                    <div className="form-group">
                      <input type="text" className="form-control" id="" value="28" disabled=""/>
                    </div>
                  </div>
                  <div className="con-option">
                    <div className="form-group">
                      <input type="text" className="form-control" id="" value="年紀" disabled=""/>
                    </div>
                    <div className="form-group">
                      <input type="text" className="form-control judgment" id="" value=">" disabled=""/>
                    </div>
                    <div className="form-group">
                      <input type="text" className="form-control" id="" value="28" disabled=""/>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </form>
          <div className="btn-block center-block">
            <button type="submit" className="btn btn-lg btn-default">編輯條件</button>
          </div>
        </div>
      );
    }
  };
};