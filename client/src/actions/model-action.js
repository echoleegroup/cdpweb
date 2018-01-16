import {format} from 'util';
import action from './action';
import moment from "moment/moment";
import numeral from 'numeral';

const POTENTIAL_TARGET_SUMMARY = '/api/target/%s/%s/potential/summary';
const ModelAction = {};

ModelAction.getPotentialTargetSummary = (mdId, batId, callback) => {
  let url = format(POTENTIAL_TARGET_SUMMARY, mdId, batId);
  action.ajaxGetObservable(url, undefined, undefined).subscribe(data => {
    if (data) {
      data.categCount = numeral(data.categCount).format('0,0');
      data.lastTimeBatch = moment(data.lastTimeBatch).format('YYYY/MM/DD HH:mm:ss');
    }
    callback(data);
  }, err => {
    console.log('===getPotentialTargetSummary failed: ', err);
    callback({});
  });
};

export default ModelAction;