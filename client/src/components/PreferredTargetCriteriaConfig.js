import React from 'react';

export default class PreferredTargetCriteriaConfig extends React.Component {
  render() {
    return (
      <div className="condition edit">{/*<!-- 條件設定 編輯狀態-->*/}
        <form className="form-horizontal">
          <div className="level form-inline">
            {/*<!-- head -->*/}
            <div className="head">
              以下條件
              <select className="form-control">
                <option>任一</option>
                <option>全部</option>
              </select>成立
              <i className="fa fa-times" aria-hidden="true" />
            </div>
            {/*<!-- 第二層 -->*/}
            <div className="level form-inline">
              <div className="con-option">
                <div className="form-group">
                  <input type="text" className="form-control" id="" defaultValue="最近訪問日" disabled=""/>
                </div>
                <div className="form-group">
                  <select className="form-control judgment" disabled="">
                    <option>=</option>
                    <option>≠</option>
                    <option>&gt;</option>
                    <option>&gt;=</option>
                    <option>
                      &lt;
                    </option>
                    <option>
                      &lt;=
                    </option>
                    <option>為</option>
                    <option>不為</option>
                  </select>
                </div>
                <div className="form-group">
                  <input type="text" className="form-control" id="" defaultValue="2017/03/01" disabled=""/>
                </div>
                <i className="fa fa-times" aria-hidden="true"/>
              </div>
              {/*<!-- head -->*/}
              <div className="head">
                以下條件
                <select className="form-control">
                  <option>任一</option>
                  <option>全部</option>
                </select>成立
                <i className="fa fa-times" aria-hidden="true"/>
              </div>
              {/*<!-- 第三層 -->*/}
              <div className="level form-inline">
                <div className="con-option">
                  <div className="form-group">
                    <input type="text" className="form-control" id="" defaultValue="年紀" disabled=""/>
                  </div>
                  <div className="form-group">
                    <select className="form-control judgment" disabled="">
                      <option>=</option>
                      <option>≠</option>
                      <option>&gt;</option>
                      <option>&gt;=</option>
                      <option>
                        &lt;
                      </option>
                      <option>
                        &lt;=
                      </option>
                      <option>為</option>
                      <option>不為</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <input type="text" className="form-control" id="" defaultValue="28" disabled=""/>
                  </div>
                  <i className="fa fa-times" aria-hidden="true"/>
                </div>
                <div className="con-option">
                  <div className="form-group">
                    <input type="text" className="form-control" id="" defaultValue="年紀" disabled=""/>
                  </div>
                  <div className="form-group">
                    <select className="form-control judgment" disabled="">
                      <option>=</option>
                      <option>≠</option>
                      <option>&gt;</option>
                      <option>&gt;=</option>
                      <option>
                        &lt;
                      </option>
                      <option>
                        &lt;=
                      </option>
                      <option>為</option>
                      <option>不為</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <input type="text" className="form-control" id="" defaultValue="28" disabled=""/>
                  </div>
                  <i className="fa fa-times" aria-hidden="true"/>
                </div>
                <div className="con-option">
                  <div className="form-group">
                    <input type="text" className="form-control" id="" defaultValue="年紀" disabled=""/>
                  </div>
                  <div className="form-group">
                    <select className="form-control judgment" disabled="">
                      <option>=</option>
                      <option>≠</option>
                      <option>&gt;</option>
                      <option>&gt;=</option>
                      <option>
                        &lt;
                      </option>
                      <option>
                        &lt;=
                      </option>
                      <option>為</option>
                      <option>不為</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <input type="text" className="form-control" id="" defaultValue="28" disabled=""/>
                  </div>
                  <i className="fa fa-times" aria-hidden="true"/>
                </div>
              </div>
              {/*<!-- 加條件 條件組合 -->*/}
              <div className="add_condition">
                <button type="submit" id="openModal1" className="btn btn-warning">
                  <i className="fa fa-plus" aria-hidden="true" />加條件
                </button>
              </div>
            </div>
            {/*<!-- 第二層 -->*/}
            <div className="level form-inline">
              {/*<!-- head -->*/}
              <div className="head">
                以下條件
                <select className="form-control">
                  <option>任一</option>
                  <option>全部</option>
                </select>成立
                <i className="fa fa-times" aria-hidden="true"/>
              </div>
              {/*<!-- 第三層 -->*/}
              <div className="level form-inline">
                <div className="con-option">
                  <div className="form-group">
                    <input type="text" className="form-control" id="" defaultValue="年紀" disabled=""/>
                  </div>
                  <div className="form-group">
                    <select className="form-control judgment" disabled="">
                      <option>=</option>
                      <option>≠</option>
                      <option>&gt;</option>
                      <option>&gt;=</option>
                      <option>
                        &lt;
                      </option>
                      <option>
                        &lt;=
                      </option>
                      <option>為</option>
                      <option>不為</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <input type="text" className="form-control" id="" defaultValue="28" disabled=""/>
                  </div>
                  <i className="fa fa-times" aria-hidden="true"/>
                </div>
                <div className="con-option">
                  <div className="form-group">
                    <input type="text" className="form-control" id="" defaultValue="年紀" disabled=""/>
                  </div>
                  <div className="form-group">
                    <select className="form-control judgment" disabled="">
                      <option>=</option>
                      <option>≠</option>
                      <option>&gt;</option>
                      <option>&gt;=</option>
                      <option>
                        &lt;
                      </option>
                      <option>
                        &lt;=
                      </option>
                      <option>為</option>
                      <option>不為</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <input type="text" className="form-control" id="" defaultValue="28" disabled=""/>
                  </div>
                  <i className="fa fa-times" aria-hidden="true"/>
                </div>
                <div className="con-option">
                  <div className="form-group">
                    <input type="text" className="form-control" id="" defaultValue="年紀" disabled=""/>
                  </div>
                  <div className="form-group">
                    <select className="form-control judgment" disabled="">
                      <option>=</option>
                      <option>≠</option>
                      <option>&gt;</option>
                      <option>&gt;=</option>
                      <option>
                        &lt;
                      </option>
                      <option>
                        &lt;=
                      </option>
                      <option>為</option>
                      <option>不為</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <input type="text" className="form-control" id="" defaultValue="28" disabled=""/>
                  </div>
                  <i className="fa fa-times" aria-hidden="true"/>
                </div>
              </div>
              {/*<!-- 加條件 條件組合 -->*/}
              <div className="add_condition">
                <button type="submit" className="btn btn-warning">
                  <i className="fa fa-plus" aria-hidden="true"/>加條件
                </button>
              </div>
            </div>
            {/*<!-- 加條件 條件組合 -->*/}
            <div className="add_condition">
              <button type="submit" className="btn btn-warning">
                <i className="fa fa-plus" aria-hidden="true"/>加條件
              </button>
              <button type="submit" className="btn btn-warning">
                <i className="fa fa-plus" aria-hidden="true"/>加條件組合
              </button>
            </div>
          </div>
        </form>
        <div className="btn-block center-block">
          <button type="submit" className="btn btn-lg btn-default">完成編輯</button>
        </div>
      </div>
    );
  };
}