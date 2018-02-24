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
          operator: 'eq'  //eq, ne, lt, le, gt, ge, in, ni
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
        }, {
          id: shortid.generate(),
          type: 'field',
          field_id: 'MAIN_ISCAUSRNTRL',
          field_label: '車輛使用人',
          ref: '_____',
          value: ['1'],
          value_label: ['自然人'],
          data_type: '___',
          operator: 'eq'
        }, {
          id: shortid.generate(),
          type: 'bundle',
          operator: 'or',
          criteria: [{
            id: shortid.generate(),
            type: 'field',
            field_id: 'CRCAMF_STSCD',
            field_label: '保有狀況',
            ref: '_____',
            value: ['1'],
            value_label: ['保有'],
            data_type: '___',
            operator: 'eq'
          }, {
            id: shortid.generate(),
            type: 'field',
            field_id: 'CRCCMF_CRCLASS',
            field_label: 'CR等級',
            ref: '_____',
            value: ['A'],
            value_label: ['A'],
            data_type: '___',
            operator: 'eq'
          }]
        }, {
          id: shortid.generate(),
          type: 'field',
          field_id: 'CRCAMF_ISHTCAR',
          field_label: '車輛識別',
          ref: '_____',
          value: ['H'],
          value_label: ['和泰車'],
          data_type: '___',
          operator: 'eq'
        }, {
          id: shortid.generate(),
          type: 'field',
          field_id: 'CRCRMF_ISSLRINCM',
          field_label: 'CR業代',
          ref: '_____',
          value: ['CR_1'],
          value_label: ['現職業代'],
          data_type: '___',
          operator: 'eq'
        }, {
          id: shortid.generate(),
          type: 'field',
          field_id: 'MAIN_ISLICSNOPRV',
          field_label: '車牌',
          ref: '_____',
          value: ['taxi', 'legal', 'rental'],
          value_label: ['計程車', '法人車', '租賃車'],
          data_type: '___',
          operator: 'ni'  //not in
        }]
      }
    ],  //車輛屬性資料 end
    transaction: [  //明細資料指定條件
      {
        id: shortid.generate(),
        type: 'combo',
        operator: 'and',
        criteria: [{
          id: shortid.generate(),
          type: 'refTransaction',
          operator: 'and',
          ref: 'insurance',
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
        }, {
          id: shortid.generate(),
          type: 'refTransaction',
          operator: 'not',
          ref: 'custom_note',
          ref_label: '客戶註記',
          criteria: [{
            id: shortid.generate(),
            type: 'field',
            field_id: 'CRCMDF_DEF_CMCHANNEL_F',
            field_label: '不聯絡註記',
            value: ['FA','FB','FC','FD'],  //timestamp of 2015/01/01
            value_label: ['FA','FB','FC','FD'],
            data_type: '___',
            ref: '______',
            operator: 'in'
          }]
        }]
      } //明細資料指定條件 end
    ],
    tag: [],  //標籤篩選 end
    trail: [] //軌跡篩選 end
  },
  export: {
    master: {
      features: [
        //master
        'MAIN_LICSNO',      //車牌
        'MAIN_CALICSNM',    //領照人姓名
        'MAIN_CALICSID',    //領照人ID
        'MAIN_CAUSRNM',     //使用人姓名
        'MAIN_CAUSRID',     //使用人ID
        'MAIN_CAUSRADDR',   //使用人地址
        'MAIN_CAUSRMOBI',   //使用人手機
        'CRCRMF_CRDLR',     //CR經銷商
        'CRCRMF_CRBRNH',    //CR營業所
        'CRCRMF_CRSALR',    //CR業代工號
        'SLMNMF_SALSNM',    //CR業代姓名
        '___',          //APP認證
        'CRCAMF_SEDLDT',    //交車日期
        'MAIN_CARCD',       //車名
        'CRCCMF_LRDT',      //上次回廠日
        'CRCAMF_FENDAT',    //強制險到期日
        'CRCAMF_UENDAT',    //任意險到期日
        'SRWHMF_LRKM',      //回廠里程數
        'CRCMDF_CMCHANNEL', //不聯絡註記

        //從RDB撈出固定的樣貌分析欄位(主表)
        'MAIN_CARCD',       //車名
        'CRCCMF_CRCLASS',   //CR等級
        'SRWHMF_USEFRE',    //每萬公里行駛頻率
        'SRWHMF_USEMONS',   //萬公里平均月份
        '___',                 //使用者年齡
        '___',                 //使用人性別
        'CRCAMF_FENDAT',    //強制險到期日
        'CRCAMF_UENDAT'     //任意險到期日
      ],
      filter: {}
    },
    relatives: {
      //從RDB撈出固定的樣貌分析欄位(保險明細)
      refInsurance: {
        features: [
          'MAIN_LICSNO',            //車牌
          'MAIN_ISEQNO',            //投保編號
          'ISMISITEMS_CREATEDT',    //要保書建立日期
          'ISMAIN_DPR_GRADE',       //今年責任險等級
          'ISMAIN_EGNO',            //引擎/車身號碼
          'ISMAIN_CUSTNM',          //被保險人(領照人)
          'ISMISITEMS_DEDUCT',      //自負額
          'ISMISITEMS_ISAMT',       //保險費
          'MAIN_ISCD'               //險種代碼
        ],
        filter: {
          period_start_value: 1483228800000,
          period_start_label: '2017/01/01',
          period_end_value: 1506729600000,
          period_end_label: '2017/09/30',
          feature: '____'  //從RDB撈出的預設時間欄位
        }
      }
    }
  }
};