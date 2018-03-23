import React from 'react';
import Loader from 'react-loader';
import {xor, debounce, assign} from 'lodash';
import shortid from 'shortid';
import {List} from "immutable";
import {CRITERIA_COMPONENT_DICT} from "../utils/criteria-dictionary";
import PickerMultiple from './PickerMultiple'
import {NODE_TYPE_DICT as NODE_TYPE} from "../utils/tree-node-util";

const INITIAL_CRITERIA = Object.freeze({
  id: undefined,
  type: CRITERIA_COMPONENT_DICT.TRAIL_HIT,
  value: undefined,
  value_label: undefined
});

const extractAllNode = (nodes) => {
  return nodes.reduce((accumulator, node) => {
    switch (node.type) {
      case NODE_TYPE.Branch:
        return accumulator.concat(extractAllNode(node.children));
      case NODE_TYPE.Tail:
        accumulator.push(node);
        return accumulator;
    }
  }, []);
};

// const filterNodes = (nodes) => {
//   return nodes.reduce((accumulator, node) => {
//     switch (node.type) {
//       case NODE_TYPE.Branch:
//         node
//         return accumulator.concat(filterNodes(node.children));
//       case NODE_TYPE.Tail:
//         accumulator.push(node);
//         return accumulator;
//     }
//   }, []);
// };

const toggleList = (target, selected) => {
  // console.log('toggleList target: ', target);
  return xor([target], selected, 'id');
};

export default class TrailHitPickerModal extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      isOpen: false,
      isLoaded: false,
      collapse: true,
      selected: List(),
      options: List()
    };

    this.composition = false;
    this.keyword = '';
    this.dataHandler = props.dataHandler;
  };

  componentWillMount() {
    this.openModal = (callback) => {
      // console.log('CriteriaAssignment::openModal');
      this.responseCriteria = callback;
      this.setState(prevState => ({
        isOpen: true
      }));
      $('body').addClass('noscroll');
    };

    this.abort = () => {
      $('body').removeClass('noscroll');

      this.composition = false;
      this.keyword = '';
      this.setState({
        isOpen: false,
        isLoaded: false,
        collapse: true,
        selected: List(),
        options: List()
      }, () => {
        this.dataHandler(null, (data) => {
          this.setState({
            isLoaded: true,
            options: List(data)
          });
        });
      });
    };

    this.submit = () => {
      let res = this.state.selected.toJS().map(node => {
        return assign({}, INITIAL_CRITERIA, {
          id: shortid.generate(),
          value: node.id,
          value_label: node.name
        })
      });

      this.responseCriteria(res);
      this.abort();
    };

    this.selectAllOptions = () => {
      let allNode = extractAllNode(this.state.options.toJS());
      this.setState({
        selected: List(allNode)
      });
    };

    this.deselectAllOptions = () => {
      this.setState({
        selected: List()
      });
    };

    this.selectAllOnChangeHandler = (e) => {
      console.log('selectAllOnChangeHandler: ', e);
      let checked = e.target.checked;
      if (checked) {
        this.selectAllOptions();
      } else {
        this.deselectAllOptions();
      }
    };

    this.optionsFilter = (e) => {
      let keyword = this.keywordInput.value;
      if (!this.composition && this.keyword !== keyword) {
        console.log('keyword: ', keyword);
        this.keyword = keyword;

        this.setState({isLoaded: false});

        this.dataHandler(this.keyword, (data) => {
          this.setState({
            isLoaded: true,
            options: List(data)
          });
        });
      }
    };

    this.tailClickHandler = (node) => {
      this.setState(prevState => ({
        selected: List(toggleList(node, prevState.selected.toJS()))
      }));
    };

    this.dataHandler(null, (data) => {
      this.setState({
        isLoaded: true,
        options: List(data)
      });
    });
  };

  render() {
    let display = (this.state.isOpen)? '': 'none';
    return (
      <div className="modal" style={{display: display}}>
        <div className="table_block">
          <h2>{this.props.title}</h2>
          <div className="modalContent">
            {/*<div className="form-group">*/}
              {/*<label htmlFor="inputName" className="col-sm-3 control-label form-inline">活動日期</label>*/}
              {/*<!-- 日期js請參考 :http://eonasdan.github.io/bootstrap-datetimepicker/ -->*/}
              {/*<div className="col-sm-8">*/}
                {/*<div className="form-inline">*/}
                  {/*<input type="text" className="form-control" placeholder=""/>*/}
                  {/*<span> ~ </span>*/}
                  {/*<input type="text" className="form-control" placeholder=""/>*/}
                {/*</div>*/}
              {/*</div>*/}
            {/*</div>*/}
            <div className="form-group">
              <label htmlFor="inputName" className="col-sm-2 control-label">標題</label>
              <div className="col-sm-9">
                <div className="form-inline">
                  <input type="text" className="form-control" defaultValue={null}
                         ref={(e) => {this.keywordInput = e;}}
                         onCompositionEnd={(e) => {this.composition = false;}}
                         onCompositionStart={(e) => {this.composition = true;}}
                         onInput={debounce(this.optionsFilter, 300)}
                  />
                  {/*<button type="button" className="btn btn-default" aria-hidden="true" onClick={this.optionsFilter}>查詢</button>*/}
                </div>
              </div>
            </div>
            <div className="form-group form-inline" style={{marginBottom: '0px'}}>
              <h3>查詢結果</h3>
              <label className="pull-right" style={{marginTop: '-35px'}}>
                <input type="checkbox" defaultChecked={false} onClick={this.selectAllOnChangeHandler}/> 全選
              </label>
            </div>
            <Loader loaded={this.state.isLoaded}>
              <PickerMultiple nodes={this.state.options}
                              selected={this.state.selected.toJS()}
                              tailClickHandler={this.tailClickHandler}/>
            </Loader>
          </div>
          <div className="btn-block center-block">
            <button type="button" className="btn btn-lg btn-default" onClick={this.submit}>加入</button>
            <button type="button" className="btn btn-lg btn-default" onClick={this.abort}>關閉</button>
          </div>
        </div>
      </div>
    );
  };
}