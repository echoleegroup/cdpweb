import React from 'react';
import {find} from 'lodash';
import PickerSingle from './PickerSingle'

export default class PickerMultiple extends PickerSingle {

  TailContainer(props) {
    let node = props.node;
    let checked = !!find(props.selected, {id: node.id});
    return (
      <li className="checkbox">
        <label>
          <input
            type="checkbox"
            name="optradio"
            onChange={props.clickHandler}
            checked={checked}/>{node.label}
            <span className="type">{node.category_label}</span>
        </label>
      </li>
    );
  };
};