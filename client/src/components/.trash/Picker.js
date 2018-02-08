import React from 'react';

/**
 * [
 {
   type: 'tail',
   id: 'last_visit_date',
   label: '最後訪問日',
   onSelect: (data) => {}
   //___: 'date',
   //default_value: Date.now()
 }, {
        type: 'branch',
        id: 'customer_profile',
        label: '客戶屬性',
        children: [{
          type: 'node',
          id: 'gender',
          label: '性別',
          data_type: '___',
          ref: 'gender',
          default_value: ['M']
        }, {
          type: 'tail',
          id: 'gender2',
          label: '性別2',
          data_type: '___',
          ref: 'booleanYN',
          default_value: ['M']
        }, {
          type: 'tail',
          id: 'age',
          label: '年紀',
          data_type: '___'
        }]
      }, {
        type: 'branch',
        id: 'inter_action',
        label: '互動狀態',
        children: [{
          type: 'tail',
          id: 'lexus',
          label: 'LEXUS保有台數',
          data_type: '___'
        }, {
          type: 'tail',
          id: 'toyota',
          label: 'TOYOTA保有台數',
          data_type: '___'
        }]
      }
 ]
 */

const NODE_TYPE = {
  Branch: 'branch',
  Tail: 'tail'
};

export default class Picker extends React.PureComponent {

  render() {
    return (
      <div className="addCondition">
        <Tree {...this.props}/>
      </div>
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
    let props = this.props;
    return (
      <ul>
        {props.nodes.map(node => {
          return this.nodeDispatcher(node);
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
      <li className="radio" key={node.id}>
        <label>
          <TailContainer
                 name="optradio"
                 onClick={this.selectHandler}/>{node.label}</label>
      </li>
    );
  };
}