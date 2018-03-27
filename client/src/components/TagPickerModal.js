import React from 'react';
import Loader from 'react-loader';
import {xorBy, debounce, assign, filter, uniqBy, differenceBy, difference} from 'lodash';
import shortid from 'shortid';
import {List} from "immutable";
import {CRITERIA_COMPONENT_DICT} from "../utils/criteria-dictionary";
import PickerMultiple from './PickerMultiple'
import {NODE_TYPE_DICT as NODE_TYPE} from "../utils/tree-node-util";

const INITIAL_CRITERIA = Object.freeze({
  id: undefined,
  type: CRITERIA_COMPONENT_DICT.FIELD_TAG,
  value: undefined,
  value_label: undefined
});

const extractAllNode = (nodes) => {
  let tailNodes = filter(nodes, {type: NODE_TYPE.Tail});
  // console.log('tailNodes: ', tailNodes);
  return filter(nodes, {type: NODE_TYPE.Branch}).reduce((accumulator, branchNode) => {
    return accumulator.concat(extractAllNode(branchNode.children))
  }, tailNodes);
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
  return xorBy([target], selected, 'id');
};

export default class TagPickerModal extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      isOpen: false,
      isLoaded: false,
      collapse: true,
      selected: List(),
      options: [],
      filteredOptions: []
    };

    this.composition = false;
    this.keyword = '';
    this.dataHandler = props.dataHandler;
  };

  componentWillMount() {
    this.openModal = (callback) => {
      // console.log('CriteriaAssignment::openModal');
      this.responseCriteria = callback;
      this.setState({
        isOpen: true
      });
      $('body').addClass('noscroll');
    };

    this.abort = () => {
      $('body').removeClass('noscroll');

      this.composition = false;
      this.keyword = '';
      this.keywordInput.value = this.keyword;
      this.setState(prevState => ({
        isOpen: false,
        // isLoaded: false,
        collapse: true,
        // selected: List(),
        filteredOptions: prevState.options
      }));
    };

    this.submit = () => {
      let res = this.state.selected.toJS().map(node => {
        return assign({}, INITIAL_CRITERIA, {
          id: shortid.generate(),
          value: node.id,
          value_label: node.label
        })
      });

      this.responseCriteria(res);
      this.abort();
    };

    this.selectAllOptions = () => {
      // const mergeHandler = (oldVal, newVal) => {};
      // this.setState(prevState => ({
      //   selected: mergeWith((oldVal, newVal) => {}, this.state)
      // }));

      let allNode = extractAllNode(this.state.filteredOptions);
      this.setState(prevState => ({
        selected: List(uniqBy(prevState.selected.toJS().concat(allNode), 'id'))
      }));
    };

    this.deselectAllOptions = () => {
      let allNode = extractAllNode(this.state.filteredOptions);
      this.setState(prevState => ({
        selected: List(differenceBy(prevState.selected.toJS(), allNode, 'id'))
      }));
    };

    this.selectAllOnChangeHandler = (e) => {
      // console.log('selectAllOnChangeHandler: ', e.target.checked);
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

        this.setState(prevState => ({
          filteredOptions: filter(prevState.options, (option => option.label.indexOf(this.keyword) > -1)),
          isLoaded: true
        }));

        // this.dataHandler(this.keyword, (data) => {
        //   this.setState({
        //     isLoaded: true,
        //     options: List(data)
        //   });
        // });
      }
    };

    this.tailClickHandler = (node) => {
      this.setState(prevState => ({
        selected: List(toggleList(node, prevState.selected.toJS()))
      }));
    };

    this.dataHandler(null, (data) => {
      // console.log('this.props.selected', this.props.selected);
      // let optionImmutable = List(data);
      this.setState({
        isLoaded: true,
        options: data,
        filteredOptions: data,
        selected: List(filter(data, option => this.props.selected.indexOf(option.id) > -1))
      });
    });
  };

  componentWillReceiveProps(nextProps) {
    // this.setState(prevState => ({
    //   selected: List(filter(prevState.options, option => nextProps.selected.indexOf(option.id) > -1))
    // }));
    if (this.props.selected.length !== nextProps.selected.length ||
      difference(this.props.selected, nextProps.selected).length > 0) {
      this.setState(prevState => ({
        selected: List(filter(prevState.options, option => nextProps.selected.indexOf(option.id) > -1))
      }));
    }
  };

  componentWillUpdate() {
    console.log('TagPickerModal will update');
  };

  componentWillUnmount() {
    console.log('TagPickerModal will unmount');
  }

  render() {
    let display = (this.state.isOpen)? '': 'none';
    return (
      <div className="modal" style={{display: display}}>
        <div className="table_block">
          <h2>{this.props.title}</h2>
          <div className="modalContent">
            <div className="form-group">
              <label htmlFor="inputName" className="col-sm-2 control-label">標籤</label>
              <div className="col-sm-9">
                <div className="form-inline">
                  <input type="text" className="form-control" defaultValue={null}
                         ref={(e) => {this.keywordInput = e;}}
                         onCompositionEnd={(e) => {this.composition = false;}}
                         onCompositionStart={(e) => {this.composition = true;}}
                         onInput={debounce(this.optionsFilter, 500)}
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
              <PickerMultiple nodes={this.state.filteredOptions}
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