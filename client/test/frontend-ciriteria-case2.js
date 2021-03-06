const shortid = require('shortid');

module.exports = {
  criteria: {
    client: [
      { //顧客屬性條件
        //consumer: 'holder', //holder: 使用人  owner: 領照人  contact: 聯絡人
        id: shortid.generate(),
        type: 'combo',  //combo, refTransaction, field, bundle, refTag, fieldTag, refTrailPeriod, refTrailHit
        operator: 'and',  //and, or, not
        criteria: [{
          id: shortid.generate(),
          type: 'field',
          field_id: 'CRAURF_TARGET',
          field_label: '使用人',
          value: ['2'],
          value_label: ['使用人'],
          data_type: '___',
          ref: '_____',
          operator: 'eq'    //eq, ne, lt, le, gt, ge, in, ni
        }, {
          id: shortid.generate(),
          type: 'field',
          field_id: 'CRCUMF_CUSTS',
          field_label: '聯絡狀態',
          value: ['1'],
          value_label: ['正常'],
          data_type: '___',
          ref: '_____',
          operator: 'eq'
        }]
      }
    ], //顧客屬性條件 end
    vehicle: [
      {  //車輛屬性資料
        id: shortid.generate(),
        type: 'combo',
        operator: 'and',
        criteria: [{
          id: shortid.generate(),
          type: 'field',
          field_id: 'CRCAMF_SEDLDT',
          field_label: '交車年份',
          ref: null,
          value: 1388534400000,
          data_type: '___',
          value_label: '2014/1/1',
          operator: 'ge'
        }, {
          id: shortid.generate(),
          type: 'field',
          field_id: 'CRCAMF_SEDLDT',
          field_label: '交車年份',
          ref: null,
          value: 1404086400000,
          value_label: '2014/06/30',
          data_type: '___',
          operator: 'le'
        }]
      }
    ],  //車輛屬性資料 end
    transaction: [
      { //明細資料指定條件
        id: shortid.generate(),
        type: 'combo',
        operator: 'and',
        criteria: [{
          id: shortid.generate(),
          type: 'refTransaction',
          operator: 'and',
          ref: 'refInsurance',
          ref_label: '保險明細',
          criteria: [{
            id: shortid.generate(),
            type: 'field',
            field_id: 'ISMAIN_CREATEDT',
            field_label: '要保書建立日期',
            value: 1420070400000,  //timestamp of 2015/01/01
            value_label: '2015/01/01',
            data_type: '___',
            ref: null,
            operator: 'gt'
          }, {
            id: shortid.generate(),
            type: 'field',
            field_id: 'ISMAIN_CREATEDT',
            field_label: '要保書建立日期',
            value: 1514678400000,  //timestamp of 2017/12/31
            value_label: '2017/12/31',
            data_type: '___',
            ref: null,
            operator: 'lt'
          }]
        }]
      }
    ],//明細資料指定條件 end
    tag: [
      { //標籤篩選
        id: shortid.generate(),
        type: 'combo',
        operator: 'or',
        criteria: [{
          id: shortid.generate(),
          type: 'refTag',
          operator: 'or',
          ref: 'belonging_media', //自有媒體
          ref_label: '活動名單標籤',
          criteria: [{
            id: shortid.generate(),
            type: 'fieldTag',
            value: 'SIENTA',
            value_label: 'SIENTA'
          }]
        }, {
          id: shortid.generate(),
          type: 'refTag',
          operator: 'or',
          ref: 'event', //活動標籤
          ref_label: '活動名單標籤',
          criteria: [{
            id: shortid.generate(),
            type: 'fieldTag',
            value: 'SIENTA',
            value_label: 'SIENTA'
          }]
        }]
      }
    ],  //標籤篩選 end
    trail: [
      { //軌跡篩選
        id: shortid.generate(),
        type: 'combo',
        operator: 'or',
        criteria: [{
          id: shortid.generate(),
          type: 'refTrailPeriod',
          period_start_value: 1512086400000,
          period_start_label: '2017/12/01',
          period_end_value: 1513728000000,
          period_end_label: '2017/12/20',
          operator: 'and',
          ref: 'official_web', //官網
          ref_label: '官網頁面瀏覽資料',
          criteria: [{
            id: shortid.generate(),
            type: 'field',
            field_id: '__SIENTA',   //ID via trail options filter API by Echo
            field_label: '車款_SIENTA (瀏覽次數)',
            value: 10,
            value_label: 10,
            data_type: '___',
            ref: null,
            operator: 'gt'
          }]
        }, {
          id: shortid.generate(),
          type: 'refTrailHit',
          period_start_value: null,
          period_start_label: null,
          period_end_value: null,
          period_end_label: null,
          operator: 'and',
          ref: 'edm_hit', //EDM點擊
          ref_label: 'EDM點擊資料',
          criteria: [{
            id: shortid.generate(),
            type: 'fieldTag',
            value: 'toyota_promo_20171206',
            value_label: '本月TOYOTA將會有什麼好事降臨!? (2017/12/06)'
          }]
        }]
      }
    ] //軌跡篩選 end
  },
  export: {
    master: [
      //master
      'LICSNO',         //車牌
      '待加入',          //使用人姓名
      '待加入',          //使用人ID
      'CRCUMF_MOBILE',  //使用人手機
      '待加入',          //使用人地址
      '待加入',          //不聯絡註記
      '___'               //DxID
    ],
    relatives: ['belonging_media']  //自有媒體標籤
  },
  filter: {
    relatives: {
      period_start_value: 1483228800000,
      period_start_label: '2017/01/01',
      period_end_value: 1506729600000,
      period_end_label: '2017/09/30'
    }
  }
};