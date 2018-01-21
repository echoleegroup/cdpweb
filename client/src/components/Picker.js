import React from 'react';

/**
 * [
 {
   type: 'tail',
   id: 'last_visit_date',
   label: '最後訪問日',
   onSelect: (data) => {}
   //data_type: 'date',
   //default_value: Date.now()
 }, {
        type: 'branch',
        id: 'customer_profile',
        label: '客戶屬性',
        children: [{
          type: 'node',
          id: 'gender',
          label: '性別',
          data_type: 'refOption',
          ref: 'gender',
          default_value: ['M']
        }, {
          type: 'tail',
          id: 'gender2',
          label: '性別2',
          data_type: 'refOption',
          ref: 'booleanYN',
          default_value: ['M']
        }, {
          type: 'tail',
          id: 'age',
          label: '年紀',
          data_type: 'number'
        }]
      }, {
        type: 'branch',
        id: 'inter_action',
        label: '互動狀態',
        children: [{
          type: 'tail',
          id: 'lexus',
          label: 'LEXUS保有台數',
          data_type: 'number'
        }, {
          type: 'tail',
          id: 'toyota',
          label: 'TOYOTA保有台數',
          data_type: 'number'
        }]
      }
 ]
 */

const NODE_TYPE = {
  Branch: 'branch',
  Tail: 'tail'
};

const Tree = (props) => {
  return <ul>
    {props.nodes.map(node => {
      return <Node key={node.id}
                   node={node}
                   branchClickHandler={props.branchClickHandler}
                   tailClickHandler={props.tailClickHandler}/>
    })}
  </ul>
};

const Node = (props) => {
  console.log('props.node.type: ', props.node.type);
  switch (props.node.type) {
    case NODE_TYPE.Branch:
      return <Branch node={props.node}
                     branchClickHandler={props.branchClickHandler}
                     tailClickHandler={props.tailClickHandler}/>
    case NODE_TYPE.Tail:
      return <Tail node={props.node}
                   tailClickHandler={props.tailClickHandler}/>
  }
};

export default class Picker extends React.PureComponent {

  render() {
    return (
      <form className="addCondition">
        <Tree {...this.props}/>
      </form>
    );
  };
};

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
                nodes={node.children}/>
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
    return (
      <li className="radio" key={node.id}>
        <label>
          <input type="radio"
                 name="optradio"
                 onClick={this.selectHandler}/>{node.label}</label>
      </li>
    );
  };
}