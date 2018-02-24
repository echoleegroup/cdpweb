const shortid = require('shortid');

module.exports = {
  criteria: {
    client: [
      { //顧客屬性條件
        consumer: 'holder', //holder: 使用人  owner: 領照人  contact: 聯絡人
        criteria: {
          id: shortid.generate(),
          type: 'combo',  //combo, refDetails, field, bundle, tag, fingerprint
          operator: 'or',  //and, or, eq, ne, lt, le, gt, ge, not
          criteria: [{
            id: shortid.generate(),
            type: 'field',
            cate: null,
            field_id: 'last_visit_date',
            field_label: '最近訪問日',
            value: Date.now(),
            data_type: '___',
            operator: 'lg'
          }, {
            id: shortid.generate(),
            type: 'bundle',
            operator: 'and',
            criteria: [{
              id: shortid.generate(),
              type: 'field',
              cate: null,
              field_id: 'age',
              field_label: '年紀',
              value: 40,
              data_type: '___',
              operator: 'lt'
            }, {
              id: shortid.generate(),
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
        id: shortid.generate(),
        type: 'combo',
        operator: 'and',
        criteria: [{
          id: shortid.generate(),
          type: 'field',
          field_id: 'regular_recall',
          field_label: '每年連續回廠定保',
          value: ['Y'],
          data_type: '___',
          value_label: ['是'],
          operator: 'eq'
        }, {
          id: shortid.generate(),
          type: 'field',
          field_id: 'purpose',
          field_label: '類別',
          value: ['2'],
          data_type: '___',
          value_label: ['一般自用'],
          operator: 'gt'
        }]
      }, {
        id: shortid.generate(),
        type: 'combo',
        operator: 'not',
        criteria: [{
          id: shortid.generate(),
          type: 'field',
          field_id: 'regular_recall',
          field_label: '每年連續回廠定保',
          value: ['Y'],
          data_type: '___',
          value_label: ['是'],
          operator: 'eq'
        }, {
          id: shortid.generate(),
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
        id: shortid.generate(),
        type: 'combo',
        operator: 'and',
        criteria: [{
          id: shortid.generate(),
          type: 'refTransaction',
          operator: 'and',
          ref: 'point',
          ref_label: '點數明細',
          criteria: [{
            id: shortid.generate(),
            type: 'field',
            field_id: 'exchange_date',
            field_label: '兌換日期',
            value: Date.now(),
            data_type: '___',
            operator: 'ge'
          }, {
            id: shortid.generate(),
            type: 'field',
            field_id: 'exchange_price',
            field_label: '兌換金額',
            value: 2,
            data_type: '___',
            operator: 'ge'
          }]
        }, {
          id: shortid.generate(),
          type: 'refTransaction',
          operator: 'or',
          ref: 'point',
          ref_label: '點數明細',
          criteria: [{
            id: shortid.generate(),
            type: 'field',
            field_id: 'exchange_date',
            field_label: '兌換日期',
            value: Date.now(),
            data_type: '___',
            operator: 'ge'
          }, {
            id: shortid.generate(),
            type: 'field',
            field_id: 'exchange_price',
            field_label: '兌換金額',
            value: 2,
            data_type: '___',
            operator: 'ge'
          }]
        }, {
          id: shortid.generate(),
          type: 'refTransaction',
          operator: 'not',
          ref: 'point',
          ref_label: '點數明細',
          criteria: [{
            id: shortid.generate(),
            type: 'field',
            field_id: 'exchange_date',
            field_label: '兌換日期',
            value: Date.now(),
            data_type: '___',
            operator: 'ge'
          }, {
            id: shortid.generate(),
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
        id: shortid.generate(),
        type: 'combo',
        operator: 'and',
        criteria: [{
          id: shortid.generate(),
          type: 'tag',
          operator: 'or',
          ref: 'event',
          group: 'event', //活動類型
          ref_label: '活動名單標籤',
          criteria: [{
            id: shortid.generate(),
            id: '1df',
            label: '2017TOYOTA玩具愛分享',
            tag_id: {
              type1: ['111', '3333'],
              type2: ['111', '2222'],
              type3: ['3333']
            },
            tag_label: '2016TOYOTA玩具愛分享'
          }, {
            id: shortid.generate(),
            id: 'asfs',
            label: '開車愛旅遊',
            tag_id: {
              type1: ['34d', 'dff'],
              type2: ['fffff'],
              type3: []
            },
            tag_label: '2016TOYOTA玩具愛分享'
          }]
        }, {
          id: shortid.generate(),
          type: 'tag',
          operator: 'or',
          ref: 'ilovetravel',
          group: 'media',  //自有媒體
          ref_label: '自有媒體標籤',
          criteria: [{
            id: shortid.generate(),
            id: '3423',
            label: '2017TOYOTA玩具愛分享',
            tag_id: {
              type1: ['111', '3333'],
              type2: ['111', '2222'],
              type3: ['3333']
            },
            tag_label: '2016TOYOTA玩具愛分享'
          }, {
            id: shortid.generate(),
            id: 'afdsf',
            label: '開車愛旅遊',
            tag_id: {
              type1: ['34d', 'dff'],
              type2: ['fffff'],
              type3: []
            },
            tag_label: '2016TOYOTA玩具愛分享'
          }]
        }]
      },   //標籤篩選 end
    ],
    trail: [
      {
        id: shortid.generate(),
        type: 'combo',
        operator: 'and',
        criteria: [{
          id: shortid.generate(),
          type: 'fingerprint',
          operator: 'gt',
          field_id: 'product',
          field_label: '車款',
          value: 10,
          data_type: '___',
          periodFrom: Date.now(),
          periodTo: Date.now()
        }, {
          id: shortid.generate(),
          type: 'fingerprint',
          operator: 'gt',
          field_id: 'calculation',
          field_label: '購車試算',
          value: 5,
          data_type: '___',
          periodFrom: Date.now(),
          periodTo: Date.now()
        }]
      }
    ]
  }
};