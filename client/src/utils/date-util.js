import moment from "moment/moment";

exports.getDate = (date = new Date()) => {
  let m = moment(date).startOf('day');
  return {
    value: m.valueOf(),
    value_label: m.format('YYYY/MM/DD')
  };
};