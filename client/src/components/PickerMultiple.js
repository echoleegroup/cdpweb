import React from 'react';
import PickerSingle from './PickerSingle'

export default class PickerMultiple extends PickerSingle {

  TailContainer(props) {
    let node = props.node;
    return (
      <li className="checkbox">
        <label>
          <input type="checkbox" name="optradio" onClick={props.clickHandler} defaultChecked={props.isChecked}/>{node.label}</label>
      </li>
    );
  };
};