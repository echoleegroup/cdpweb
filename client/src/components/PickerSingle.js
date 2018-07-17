import React from 'react';
import {NODE_TYPE_DICT as NODE_TYPE} from '../utils/tree-node-util';

export default class PickerSingle extends React.PureComponent {

  componentWillUnmount() {
    // console.log('PickerSingle componentWillUnmount');
  };

  TailContainer(props) {
    let node = props.node;
    let checked = !!props.selected && node.id === props.selected.id;
    return (
      <li className="radio">
        <label>
          <input
            type="radio"
            name="optradio"
            onClick={props.clickHandler}
            checked={checked}/>{node.label}
          <span className="type">{node.category_label}</span>
        </label>
      </li>
    );
  };

  render() {
    return (
      <div className="addCondition">
        <ul>
          <Tree {...this.props} TailContainer={this.TailContainer}/>
        </ul>
      </div>
    );
  };
};

class Tree extends React.PureComponent {
  componentWillUnmount() {
    // console.log('Tree componentWillUnmount');
  };

  render() {
    const NodeDispatcher = (node, props) => {
      // let node = props.node;
      switch (node.type) {
        case NODE_TYPE.Branch:
          return (
            <Branch key={node.id}
                    node={node}
                    collapse={props.collapse}
              // selected={props.selected}
              // tailClickHandler={props.tailClickHandler}
              // TailContainer={props.TailContainer}
                    branchClickHandler={props.branchClickHandler}>

              <Tree branchClickHandler={props.branchClickHandler}
                    tailClickHandler={props.tailClickHandler}
                    nodes={node.children}
                    selected={props.selected}
                    TailContainer={props.TailContainer}/>
            </Branch>
          );
        case NODE_TYPE.Tail:
          return <Tail key={node.id}
                       node={node}
                       selected={props.selected}
                       tailClickHandler={props.tailClickHandler}
                       TailContainer={props.TailContainer}/>
      }
    };

    let props = this.props;
    return props.nodes.map(node => {
      // return <NodeDispatcher key={node.id} node={node} {...props}/>
      return NodeDispatcher(node, this.props);
    });
    // return (
    //   <ul>
    //     {props.nodes.map(node => {
    //       return NodeDispatcher(node, props);
    //     })}
    //   </ul>
    // );
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
          <i className={collapseConfig.class_name} aria-hidden={collapseConfig.isCollapse}/>
        </a>
        <ul style={collapseConfig.style}>
          {this.props.children}
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
        selected={this.props.selected}
        clickHandler={this.selectHandler()}/>
    );
  };
}