const shortid = require('shortid');

module.exports = {
  fields: {
    custom_target: [
      {
        type: 'tail',
        id: 'last_visit_date',
        label: '最後訪問日',
        data_type: '___',
        default_value: Date.now()
      }, {
        type: 'branch',
        id: 'customer_profile',
        label: '客戶屬性',
        nodes: [{
          type: 'node',
          id: 'gender',
          label: '性別',
          data_type: '___',
          ref: 'gender',
          default_value: ['M']
        }, {
          type: 'tail',
          id: 'gender2',
          label: '性別2',
          data_type: '___',
          ref: 'booleanYN',
          default_value: ['M']
        }, {
          type: 'tail',
          id: 'age',
          label: '年紀',
          data_type: '___'
        }]
      }, {
        type: 'branch',
        id: 'inter_action',
        label: '互動狀態',
        fields: [{
          type: 'tail',
          id: 'lexus',
          label: 'LEXUS保有台數',
          data_type: '___'
        }, {
          type: 'tail',
          id: 'toyota',
          label: 'TOYOTA保有台數',
          data_type: '___'
        }]
      }
    ],
    client: [
      {
        type: 'field',
        id: 'last_visit_date',
        label: '最後訪問日',
        data_type: '___',
        default_value: Date.now()
      }, {
        type: 'folder',
        id: 'customer_profile',
        label: '客戶屬性',
        fields: [{
          type: 'field',
          id: 'gender',
          label: '性別',
          data_type: '___', //for cassandra
          ref: 'gender',
          default_value: ['M']
        }, {
          type: 'field',
          id: 'age',
          label: '年紀',
          data_type: '___'
        }]
      }, {
        type: 'field',
        id: 'first_visit_date2',
        label: '初次訪問日',
        data_type: '___',
        default_value: Date.now()
      }, {
        id: 'inter_action',
        label: '互動狀態',
        fields: [{
          id: 'lexus',
          label: 'LEXUS保有台數',
          data_type: '___'
        }, {
          id: 'toyota',
          label: 'TOYOTA保有台數',
          data_type: '___'
        }]
      }
    ],
    vehicle: [
      {
        type: 'field',
        id: 'regular_recall',
        label: '每年連續回廠定保',
        data_type: '___',
        ref: 'booleanYN',
        default_value: ['Y']
      }, {
        type: 'field',
        id: 'purpose',
        label: '類別',
        data_type: '___',
        ref: 'carPurpose',
        default_value: ['2']
      }
    ],
    transaction: [
      {
        type: 'folder',
        id: 'point',
        label: '點數明細',
        fields: [{
          type: 'field',
          id: 'exchange_date',
          label: '兌換日期',
          default_value: Date.now(),
          data_type: '___'
        }, {
          type: 'field',
          id: 'exchange_price',
          label: '兌換金額',
          default_value: 2,
          data_type: '___'
        }]
      }, {
        type: 'folder',
        id: 'point2',
        label: '點數明細',
        fields: [{
          type: 'field',
          id: 'exchange_date2',
          label: '兌換日期',
          default_value: Date.now(),
          data_type: '___'
        }, {
          type: 'field',
          id: 'exchange_price2',
          label: '兌換金額',
          default_value: 2,
          data_type: '___'
        }]
      }
    ],
    fingerprint: [
      {
        type: 'field',
        id: 'vehicle',
        label: '足跡',
        fields: [{
          id: 'product',
          label: '車款',
          default_value: 10,
          data_type: '___',
        }, {
          type: 'field',
          id: 'calculation',
          label: '購車試算',
          default_value: 5,
          data_type: '___',
        }]
      }
    ],
  },
  tag_pools: [
    {
      type: 'folder',
      id: 'event',
      label: '活動名單標籤',
      tags: [{
        id: 123,
        label: '2016TOYOTA玩具愛分享'
      },{
        id: 234,
        label: '2017TOYOTA玩具愛分享'
      }]
    }, {
      id: 'media',
      label: '自有媒體標籤',
      tags: [{
        id: 456,
        label: 'Camery'
      },{
        id: 567,
        label: 'Altis'
      }]
    }, {
      id: 'interesting',
      label: '興趣標籤',
      tags: [{
        id: 678,
        label: '拉屎菌'
      },{
        id: 789,
        label: '頭又大'
      }]
    }
  ],
  criteria: {
    custom_target: [
      { //自訂名單下載
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
          operator: 'lt'
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
    ],
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
          value_label: '是',
          operator: 'eq'
        }, {
          id: shortid.generate(),
          type: 'field',
          field_id: 'purpose',
          field_label: '類別',
          value: ['2'],
          data_type: '___',
          value_label: '一般自用',
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
          value_label: '是',
          operator: 'eq'
        }, {
          id: shortid.generate(),
          type: 'field',
          field_id: 'purpose',
          field_label: '類別',
          value: ['1'],
          data_type: '___',
          value_label: '一般自用',
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
          type: 'refTag',
          operator: 'or',
          ref: 'event',
          group: 'group1',
          ref_label: '活動名單標籤',
          criteria: [{
            id: shortid.generate(),
            tagId: {
              type1: ['111', '3333'],
              type2: ['111', '2222'],
              type3: ['3333']
            },
            label: '2016TOYOTA玩具愛分享'
          },{
            id: shortid.generate(),
            tagId: 234,
            tagLabel: '2017TOYOTA玩具愛分享'
          }]
        }, {
          id: shortid.generate(),
          type: 'refTag',
          operator: 'and',
          ref: 'media',
          ref_label: '自有媒體標籤',
          criteria: [{
            id: shortid.generate(),
            tagId: 456,
            tagLabel: 'Camery'
          },{
            id: shortid.generate(),
            tagId: 567,
            tagLabel: 'Altis'
          }]
        }, {
          id: shortid.generate(),
          type: 'refTag',
          operator: 'not',
          ref: 'interesting',
          ref_label: '興趣標籤',
          criteria: [{
            id: shortid.generate(),
            tagId: 678,
            tagLabel: '拉屎菌'
          },{
            id: shortid.generate(),
            tagId: 789,
            tagLabel: '頭又大'
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
          type: 'refTrailHit',
          operator: 'gt',
          field_id: 'product',
          field_label: '車款',
          value: 10,
          data_type: '___',
          periodFrom: Date.now(),
          periodTo: Date.now()
        }, {
          id: shortid.generate(),
          type: 'refTrailHit',
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
  },
  refs: {
    product: [{
      codeGroup: 'product',
      codeValue: 'abc',
      codeLabel: '福義軒',
      seq: '2'
    }, {
      codeGroup: 'product',
      codeValue: 'bcd',
      codeLabel: '福義軒2',
      seq: '1'
    }, {
      codeGroup: 'product',
      codeValue: 'cde',
      codeLabel: '福義軒3',
      seq: '2d'
    }],
    carPurpose: [{
      codeGroup: 'carPurpose',
      codeValue: '1',
      codeLabel: '送禮',
      seq: '2d'
    }, {
      codeGroup: 'carPurpose',
      codeValue: '2',
      codeLabel: '自用',
      seq: '2d'
    }, {
      codeGroup: 'carPurpose',
      codeValue: '3',
      codeLabel: '兩相宜',
      seq: '2d'
    }],
    booleanYN: [{
      codeGroup: 'booleanYN',
      codeValue: 'Y',
      codeLabel: '是',
      seq: '2d'
    }, {
      codeGroup: 'booleanYN',
      codeValue: 'N',
      codeLabel: '否',
      seq: '2d'
    }],
    gender: [{
      codeGroup: 'gender',
      codeValue: 'M',
      codeLabel: '男',
      seq: '1'
    }, {
      codeGroup: 'gender',
      codeValue: 'F',
      codeLabel: '女',
      seq: '2'
    }]
  }
};