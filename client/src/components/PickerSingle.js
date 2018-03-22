import React from 'react';
import {NODE_TYPE_DICT as NODE_TYPE} from '../utils/tree-node-util';

export default class PickerSingle extends React.PureComponent {

  TailContainer(props) {
    let node = props.node;
    return (
      <li className="radio">
        <label>
          <input type="radio" name="optradio" onChange={props.clickHandler} checked={node.id === props.selectedId}/>{node.label}<span className="type">{node.category_label}</span></label>
      </li>
    );
  };
  //
  // componentWillMount() {
  //   console.log('===TailContainer componentWillMount');
  // };
  //
  // componentWillUpdate() {
  //   console.log('===TailContainer componentWillUpdate');
  // };

  render() {
    return (
      <div className="addCondition">
        <Tree {...this.props} TailContainer={this.TailContainer}/>
      </div>
    );
  };
};

class Tree extends React.PureComponent {

  render() {
    const NodeDispatcher = (node, props) => {
      switch (node.type) {
        case NODE_TYPE.Branch:
          return <Branch key={node.id}
                         node={node}
                         collapse={props.collapse}
                         selectedId={props.selectedId}
                         branchClickHandler={props.branchClickHandler}
                         tailClickHandler={props.tailClickHandler}
                         TailContainer={props.TailContainer}/>
        case NODE_TYPE.Tail:
          return <Tail key={node.id}
                       node={node}
                       selectedId={props.selectedId}
                       tailClickHandler={props.tailClickHandler}
                       TailContainer={props.TailContainer}/>
      }
    };

    let props = this.props;
    return (
      <ul>
        {props.nodes.map(node => {
          return NodeDispatcher(node, props);
        })}
      </ul>
    );
  };
}

class Branch extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      collapse: (props.collapse === undefined || props.collapse)
    }
  };

  componentWillMount() {

    this.clickHandler = () => {
      const branchClickHandler = this.props.branchClickHandler;
      return (e) => {
        if (branchClickHandler) {
          branchClickHandler(this.props.node);
        }
        this.setState(prevState => ({
          collapse: !prevState.collapse
        }));
      };
    };

    this.collapseConfig = (collapse) => {
      switch (collapse) {
        case true:
          return {
            isCollapse: true,
            class_name: 'fa fa-plus',
            style: {display: 'none'}
          };
        default:
          return {
            isCollapse: false,
            class_name: 'fa fa-minus',
            style: {}
          };
      }
    };
  };

  render() {
    let collapseConfig = this.collapseConfig(this.state.collapse);
    // console.log('collapseConfig: ', collapseConfig);
    let node = this.props.node;
    return (
      <li key={node.id}>
        <a href="javascript:;" onClick={this.clickHandler()}>{node.label}
          <i className={collapseConfig.class_name} aria-hidden={collapseConfig.isCollapse} ref={e => {
            this.foldingIconDom = e;
          }}/>
        </a>
        <ul style={collapseConfig.style} ref={e => {
          this.foldingDom = e;
        }}>
          <Tree branchClickHandler={this.props.branchClickHandler}
                tailClickHandler={this.props.tailClickHandler}
                nodes={node.children}
                selectedId={this.props.selectedId}
                TailContainer={this.props.TailContainer}/>
        </ul>
      </li>
    );
  };
}

class Tail extends React.PureComponent {
  componentWillMount() {
    this.selectHandler = () => {
      const tailClickHandler = this.props.tailClickHandler;
      return (e) => {
        if (tailClickHandler) {
          tailClickHandler(this.props.node)
        }
      };
    };
  };

  render() {
    let node = this.props.node;
    let TailContainer = this.props.TailContainer;
    return (
      <TailContainer
        name="optradio"
        node={node}
        selectedId={this.props.selectedId}
        clickHandler={this.selectHandler()}/>
    );
  };
}