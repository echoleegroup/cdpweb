import {format} from 'util';
import {ajaxGetObservable} from './action';
import moment from "moment/moment";
import numeral from 'numeral';

const POTENTIAL_TARGET_SUMMARY = '/api/target/%s/%s/potential/summary';

exports.getPotentialTargetSummary = (mdId, batId, success, fail) => {
  let url = format(POTENTIAL_TARGET_SUMMARY, mdId, batId);
  ajaxGetObservable(url, undefined, undefined).subscribe(data => {
    if (data) {
      data.categCount = numeral(data.categCount).format('0,0');
      data.lastTimeBatch = moment(data.lastTimeBatch).format('YYYY/MM/DD HH:mm:ss');
    }
    success && success(data);
  }, err => {
    console.log('===getPotentialTargetSummary failed: ', err);
    fail && fail(err);
  });
};