import React from 'react';
import {withRouter} from 'react-router-dom';

export default class ItemTreeNavigator extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      selected: {}
    };
  };

  searchAgain() {
    window.location.href = '/integration/query';
  };

  ComponentFunctionBar(props) {
    return (
      <div>
        <h2>{this.HeadlineText()}</h2>
        <button type="button" className="btn btn-default fa fa-search" onClick={this.searchAgain}>重新查詢</button>
        <button type="button" className="btn btn-default fa fa-arrow-right"/>
      </div>
    );
  };

  HeadlineText() {
    return '特徵觀察';
  };

  componentDidMount() {};

  render() {
    // let ComponentFunctionBar = this.ComponentFunctionBar.bind(this);
    // let [branchNodes, tailNodes] = partition(this.props.nodes, {
    //   type: NODE_TYPE.Branch
    // });

    return (
      <div className="table_block feature">
        {/*<ComponentFunctionBar headline={this.HeadlineText()} searchAgain={this.searchAgain.bind(this)}/>*/}
        {this.ComponentFunctionBar()}
        {this.props.nodes.map(node => {
          return (
            <BranchOfNavTree key={node.id}
                             node={node}
                             selectNode={this.props.selectNode}
                             selected={this.props.selected}/>
          );
        })}
      </div>
    );
  };
};

class BranchOfNavTree extends React.PureComponent {
  componentWillMount() {
    this.branchClickHandler = (e) => {
      let _this = e.currentTarget;
      $(_this).children('i').toggleClass('fa-minus');
      $(_this).next('.subtable').slideToggle();
    };

    this.tailClickHandler = (parentNode, currNode) => {
      this.props.selectNode(currNode, parentNode);
    };
  };

  render() {
    let node = this.props.node;
    return (
      <div>
        <h3 onClick={this.branchClickHandler}>
          {node.label}
          <span className="number">{node.children.length}</span>
          <i className="fa fa-plus" aria-hidden="true"/>
        </h3>
        <div className="table-responsive subtable" style={{display: 'none'}}>
          <table className="table table-hover table-striped table-condensed">
            <tbody>
            {node.children.map(item => {
              return (
                <tr key={item.id}>
                  <th>
                    <a href="javascript:;"
                       className={(this.props.selected.id === item.id)? 'active': null}
                       onClick={e => {
                         this.tailClickHandler(node, item);
                       }}>{item.label}</a>
                  </th>
                </tr>
              );
            })}
            </tbody>
          </table>
        </div>
      </div>
    );
  }
}