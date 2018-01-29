const shortid = require('shortid');

module.exports = {
  criteria: {
    client: [
      { //顧客屬性條件
        consumer: 'holder', //holder: 使用人  owner: 領照人  contact: 聯絡人
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
            data_type: 'date',
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
              data_type: 'number',
              operator: 'lt'
            }, {
              uuid: shortid.generate(),
              type: 'field',
              cate: null,
              field_id: 'toyota',
              field_label: 'TOYOTA保有台數',
              value: 2,
              data_type: 'number',
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
          data_type: 'refOption',
          value_label: ['是'],
          operator: 'eq'
        }, {
          uuid: shortid.generate(),
          type: 'field',
          field_id: 'purpose',
          field_label: '類別',
          value: ['2'],
          data_type: 'refOption',
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
          data_type: 'refOption',
          value_label: ['是'],
          operator: 'eq'
        }, {
          uuid: shortid.generate(),
          type: 'field',
          field_id: 'purpose',
          field_label: '類別',
          value: ['1'],
          data_type: 'refOption',
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
            data_type: 'date',
            operator: 'ge'
          }, {
            uuid: shortid.generate(),
            type: 'field',
            field_id: 'exchange_price',
            field_label: '兌換金額',
            value: 2,
            data_type: 'number',
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
            data_type: 'date',
            operator: 'ge'
          }, {
            uuid: shortid.generate(),
            type: 'field',
            field_id: 'exchange_price',
            field_label: '兌換金額',
            value: 2,
            data_type: 'number',
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
            data_type: 'date',
            operator: 'ge'
          }, {
            uuid: shortid.generate(),
            type: 'field',
            field_id: 'exchange_price',
            field_label: '兌換金額',
            value: 2,
            data_type: 'number',
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
            tag_id: {
              type1: ['111', '3333'],
              type2: ['111', '2222'],
              type3: ['3333']
            },
            tag_label: '2016TOYOTA玩具愛分享'
          }, {
            uuid: shortid.generate(),
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
            tag_id: {
              type1: ['111', '3333'],
              type2: ['111', '2222'],
              type3: ['3333']
            },
            tag_label: '2016TOYOTA玩具愛分享'
          }, {
            uuid: shortid.generate(),
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
        uuid: shortid.generate(),
        type: 'combo',
        operator: 'and',
        criteria: [{
          uuid: shortid.generate(),
          type: 'fingerprint',
          operator: 'gt',
          field_id: 'product',
          field_label: '車款',
          value: 10,
          data_type: 'number',
          periodFrom: Date.now(),
          periodTo: Date.now()
        }, {
          uuid: shortid.generate(),
          type: 'fingerprint',
          operator: 'gt',
          field_id: 'calculation',
          field_label: '購車試算',
          value: 5,
          data_type: 'number',
          periodFrom: Date.now(),
          periodTo: Date.now()
        }]
      }
    ]
  },
  refs: {
    product: [{
      refCode: 'product',
      optCode: 'abc',
      label: '福義軒',
      seq: '2'
    }, {
      refCode: 'product',
      optCode: 'bcd',
      label: '福義軒2',
      seq: '1'
    }, {
      refCode: 'product',
      optCode: 'cde',
      label: '福義軒3',
      seq: '2d'
    }],
    carPurpose: [{
      refCode: 'carPurpose',
      optCode: '1',
      label: '送禮',
      seq: '2d'
    }, {
      refCode: 'carPurpose',
      optCode: '2',
      label: '自用',
      seq: '2d'
    }, {
      refCode: 'carPurpose',
      optCode: '3',
      label: '兩相宜',
      seq: '2d'
    }],
    booleanYN: [{
      refCode: 'booleanYN',
      optCode: 'Y',
      label: '是',
      seq: '2d'
    }, {
      refCode: 'booleanYN',
      optCode: 'N',
      label: '否',
      seq: '2d'
    }],
    gender: [{
      refCode: 'gender',
      optCode: 'M',
      label: '男',
      seq: '1'
    }, {
      refCode: 'gender',
      optCode: 'F',
      label: '女',
      seq: '2'
    }]
  }
};