import React from 'react';

const NODE_TYPE = {
  Branch: 'branch',
  Tail: 'tail'
};

export default class PickerSingle extends React.PureComponent {

  TailContainer(props) {
    let node = props.node;
    return (
      <li className="radio">
        <label>
          <input type="radio" name="optradio" onClick={props.clickHandler}/>{node.label}</label>
      </li>
    );
  };

  render() {
    return (
      <form className="addCondition">
        <Tree {...this.props} TailContainer={this.TailContainer}/>
      </form>
    );
  };
};

class Tree extends React.PureComponent {

  componentWillMount() {
    this.nodeDispatcher = (node) => {
      console.log('props.node.type: ', node.type);
      switch (node.type) {
        case NODE_TYPE.Branch:
          return <Branch key={node.id}
                         node={node}
                         branchClickHandler={this.props.branchClickHandler}
                         tailClickHandler={this.props.tailClickHandler}
                         TailContainer={this.props.TailContainer}/>
        case NODE_TYPE.Tail:
          return <Tail key={node.id}
                       node={node}
                       tailClickHandler={this.props.tailClickHandler}
                       TailContainer={this.props.TailContainer}/>
      }
    }
  };

  render() {
    const NodeDispatcher = (props) => {
      let node = props.node;
      console.log('props.node.type: ', node.type);
      switch (node.type) {
        case NODE_TYPE.Branch:
          return <Branch node={node}
                         branchClickHandler={props.branchClickHandler}
                         tailClickHandler={props.tailClickHandler}
                         TailContainer={props.TailContainer}/>
        case NODE_TYPE.Tail:
          return <Tail node={node}
                       tailClickHandler={props.tailClickHandler}
                       TailContainer={props.TailContainer}/>
      }
    };

    let props = this.props;
    return (
      <ul>
        {props.nodes.map(node => {
          return <NodeDispatcher key={node.id} {...this.props} node={node}/>
        })}
      </ul>
    );
  };
}

class Branch extends React.PureComponent {
  componentWillMount() {
    this.toggleFolding = () => {
      $(this.foldingDom).toggle();
      $(this.foldingIconDom).toggleClass('fa-minus');
    };

    this.clickHandler = (e) => {
      this.props.branchClickHandler(this.props.node);
      this.toggleFolding(e);
    };
  };

  render() {
    let collapse = true;  //this.state.collapse;
    let className = 'fa fa-plus';
    let style = {display: 'none'};
    let node = this.props.node;
    /*
    if (!collapse) {
      className += ' fa-minus';
      style = {};
    }*/
    return (
      <li key={node.id}>
        <a href="#" onClick={this.clickHandler}>{node.label}
          <i className={className} aria-hidden={collapse} ref={e => {
            this.foldingIconDom = e;
          }}/>
        </a>
        <ul style={style} ref={e => {
          this.foldingDom = e;
        }}>
          <Tree branchClickHandler={this.props.branchClickHandler}
                tailClickHandler={this.props.tailClickHandler}
                nodes={node.children}
                TailContainer={this.props.TailContainer}/>
        </ul>
      </li>
    );
  };
}

class Tail extends React.PureComponent {
  componentWillMount() {
    this.selectHandler = (e) => {
      console.log('Tail::selectHandler: ', e.target.value);
      this.props.tailClickHandler(this.props.node);
    };
  };

  render() {
    let node = this.props.node;
    let TailContainer = this.props.TailContainer;
    return (
      <TailContainer
        name="optradio"
        node={node}
        clickHandler={this.selectHandler}/>
    );
  };
}