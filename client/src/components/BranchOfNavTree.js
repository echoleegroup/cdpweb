import React from 'react';

export default class BranchOfNavTree extends React.PureComponent {
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