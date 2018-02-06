const shortid = require('shortid');

module.exports = {
  criteria: {
    client: [
      { //顧客屬性條件
        //consumer: 'holder', //holder: 使用人  owner: 領照人  contact: 聯絡人
        criteria: {
          uuid: shortid.generate(),
          type: 'combo',  //combo, refDetails, field, bundle, tag, fingerprint
          operator: 'or',  //and, or, eq, ne, lt, le, gt, ge, not
          criteria: [{
            uuid: shortid.generate(),
            type: 'field',
            cate: null,
            field_id: 'last_visit_date',
            field_label: '最近訪問日',
            value: Date.now(),
            data_type: '___',
            operator: 'lg'
          }, {
            uuid: shortid.generate(),
            type: 'bundle',
            operator: 'and',
            criteria: [{
              uuid: shortid.generate(),
              type: 'field',
              cate: null,
              field_id: 'age',
              field_label: '年紀',
              value: 40,
              data_type: '___',
              operator: 'lt'
            }, {
              uuid: shortid.generate(),
              type: 'field',
              cate: null,
              field_id: 'toyota',
              field_label: 'TOYOTA保有台數',
              value: 2,
              data_type: '___',
              operator: 'gt'
            }]
          }]
        }
      }
    ], //顧客屬性條件 end
    vehicle: [
      {  //車輛屬性資料
        uuid: shortid.generate(),
        type: 'combo',
        operator: 'and',
        criteria: [{
          uuid: shortid.generate(),
          type: 'field',
          field_id: 'regular_recall',
          field_label: '每年連續回廠定保',
          value: ['Y'],
          data_type: '___',
          value_label: ['是'],
          operator: 'eq'
        }, {
          uuid: shortid.generate(),
          type: 'field',
          field_id: 'purpose',
          field_label: '類別',
          value: ['2'],
          data_type: '___',
          value_label: ['一般自用'],
          operator: 'gt'
        }]
      }, {
        uuid: shortid.generate(),
        type: 'combo',
        operator: 'not',
        criteria: [{
          uuid: shortid.generate(),
          type: 'field',
          field_id: 'regular_recall',
          field_label: '每年連續回廠定保',
          value: ['Y'],
          data_type: '___',
          value_label: ['是'],
          operator: 'eq'
        }, {
          uuid: shortid.generate(),
          type: 'field',
          field_id: 'purpose',
          field_label: '類別',
          value: ['1'],
          data_type: '___',
          value_label: ['一般自用'],
          operator: 'gt'
        }]
      }
    ],  //車輛屬性資料 end
    transaction: [
      { //明細資料指定條件
        uuid: shortid.generate(),
        type: 'combo',
        operator: 'and',
        criteria: [{
          uuid: shortid.generate(),
          type: 'refTransaction',
          operator: 'and',
          ref: 'point',
          ref_label: '點數明細',
          criteria: [{
            uuid: shortid.generate(),
            type: 'field',
            field_id: 'exchange_date',
            field_label: '兌換日期',
            value: Date.now(),
            data_type: '___',
            operator: 'ge'
          }, {
            uuid: shortid.generate(),
            type: 'field',
            field_id: 'exchange_price',
            field_label: '兌換金額',
            value: 2,
            data_type: '___',
            operator: 'ge'
          }]
        }, {
          uuid: shortid.generate(),
          type: 'refTransaction',
          operator: 'or',
          ref: 'point',
          ref_label: '點數明細',
          criteria: [{
            uuid: shortid.generate(),
            type: 'field',
            field_id: 'exchange_date',
            field_label: '兌換日期',
            value: Date.now(),
            data_type: '___',
            operator: 'ge'
          }, {
            uuid: shortid.generate(),
            type: 'field',
            field_id: 'exchange_price',
            field_label: '兌換金額',
            value: 2,
            data_type: '___',
            operator: 'ge'
          }]
        }, {
          uuid: shortid.generate(),
          type: 'refTransaction',
          operator: 'not',
          ref: 'point',
          ref_label: '點數明細',
          criteria: [{
            uuid: shortid.generate(),
            type: 'field',
            field_id: 'exchange_date',
            field_label: '兌換日期',
            value: Date.now(),
            data_type: '___',
            operator: 'ge'
          }, {
            uuid: shortid.generate(),
            type: 'field',
            field_id: 'exchange_price',
            field_label: '兌換金額',
            value: 2,
            data_type: '___',
            operator: 'ge'
          }]
        }]
      },//明細資料指定條件 end
    ],
    tags: [
      { //標籤篩選
        uuid: shortid.generate(),
        type: 'combo',
        operator: 'and',
        criteria: [{
          uuid: shortid.generate(),
          type: 'tag',
          operator: 'or',
          ref: 'event',
          group: 'event', //活動類型
          ref_label: '活動名單標籤',
          criteria: [{
            uuid: shortid.generate(),
            id: '1df',
            label: '2017TOYOTA玩具愛分享',
            tag_label: '2016TOYOTA玩具愛分享'
          }, {
            uuid: shortid.generate(),
            id: 'asfs',
            label: '開車愛旅遊',
            tag_label: '2016TOYOTA玩具愛分享'
          }]
        }, {
          uuid: shortid.generate(),
          type: 'tag',
          operator: 'or',
          ref: 'ilovetravel',
          group: 'media',  //自有媒體
          ref_label: '自有媒體標籤',
          criteria: [{
            uuid: shortid.generate(),
            id: '3423',
            label: '2017TOYOTA玩具愛分享',
            tag_label: '2016TOYOTA玩具愛分享'
          }, {
            uuid: shortid.generate(),
            id: 'afdsf',
            label: '開車愛旅遊',
            tag_label: '2016TOYOTA玩具愛分享'
          }]
        }]
      },   //標籤篩選 end
    ],
    trail: [
      { //標籤篩選
        uuid: shortid.generate(),
        type: 'combo',
        operator: 'and',
        criteria: [{
          uuid: shortid.generate(),
          type: 'trail',
          operator: 'or',
          ref: 'official',
          group: 'type_1', //活動類型
          period_start: Date.now(),
          period_end: Date.now(),
          ref_label: '官網頁面瀏覽資料',
          criteria: []
        }, {
          uuid: shortid.generate(),
          type: 'trail',
          operator: 'or',
          ref: 'app',
          group: 'type_3', //活動類型
          period_start: null,
          period_end: null,
          ref_label: 'APP頁面瀏覽資料',
          criteria: []
        }]
      },   //標籤篩選 end
    ]
  }
};