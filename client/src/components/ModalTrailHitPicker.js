import React from 'react';
import ModalTagPicker from './ModalTagPicker';
import {CRITERIA_COMPONENT_DICT} from "../utils/criteria-dictionary";

export default class ModalTrailHitPicker extends ModalTagPicker {
  bundleType() {
    return CRITERIA_COMPONENT_DICT.FIELD_TRAIL_TAG;
  };

  inputLabel() {
    return '標題';
  };
}