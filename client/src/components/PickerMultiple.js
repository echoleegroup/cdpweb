import React from 'react';
import PickerSingle from './PickerSingle'

export default class PickerMultiple extends PickerSingle {

  TailContainer(props) {
    let node = props.node;
    return (
      <li className="checkbox">
        <label>
          <input type="checkbox" name="optradio" onChange={props.clickHandler} checked={props.selectedId.indexOf(node.id) > -1}/>{node.label}<span className="type">{node.category_label}</span></label>
      </li>
    );
  };
};