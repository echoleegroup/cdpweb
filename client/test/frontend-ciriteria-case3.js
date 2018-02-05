const shortid = require('shortid');

module.exports = {
  criteria: {
    tag: [
      { //標籤篩選
        uuid: shortid.generate(),
        type: 'combo',  //combo, refTransaction, field, bundle, refTag, fieldTag, refTrailPeriod, refTrailHit
        operator: 'and',  //and, or, not
        criteria: [{
          uuid: shortid.generate(),
          type: 'refTag',
          operator: 'or',
          ref: 'belonging_media', //自有媒體
          ref_label: '活動名單標籤',
          criteria: [{
            uuid: shortid.generate(),
            value: 'SIENTA',
            value_label: 'SIENTA'
          }]
        }]
      }
    ],  //標籤篩選 end
    trail: [
      { //軌跡篩選
        uuid: shortid.generate(),
        type: 'combo',
        operator: 'and',
        criteria: [{
          uuid: shortid.generate(),
          type: 'refTrailPeriod',
          period_start_value: 1512086400000,
          period_start_label: '2017/12/01',
          period_end_value: 1513728000000,
          period_end_label: '2017/12/20',
          operator: 'and',
          ref: 'official_web', //官網
          ref_label: '官網頁面瀏覽資料',
          criteria: [{
            uuid: shortid.generate(),
            type: 'field',
            field_id: '__SIENTA',   //ID via trail options filter API by Echo
            field_label: '車款_SIENTA (瀏覽次數)',
            value: 10,
            value_label: 10,
            data_type: 'number',
            ref: null,
            operator: 'gt'    //eq, ne, lt, le, gt, ge, in, ni
          }]
        }]
      }
    ] //軌跡篩選 end
  },
  export: {
    master: [
      //master
      '___',           //線上用戶UUID
      '___',           //CanvasID
      '___',           //CookieID
      '___'            //車牌
    ],
    relatives: []
  },
  filter: {
    relatives: {}
  }
};