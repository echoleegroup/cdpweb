import shortid from 'shortid';
export default {
  fields: {
    preferred_target: {
      _none: {
        fields: [{
          id: 'last_visit_date',
          label: '最後訪問日',
          data_type: 'date',
          default_value: Date.now()
        }]
      },
      customer_profile: {
        id: 'customer_profile',
        label: '客戶屬性',
        fields: [{
          id: 'gender',
          label: '性別',
          data_type: 'refOption', //for cassandra
          ref: 'gender',
          default_value: 'M'
        }, {
          id: 'age',
          label: '年紀',
          data_type: 'number'
        }]
      },
      interaction: {
        id: 'inter_action',
        label: '互動狀態',
        fields: [{
          id: 'lexus',
          label: 'LEXUS保有台數',
          data_type: 'number'
        }, {
          id: 'toyota',
          label: 'TOYOTA保有台數',
          data_type: 'number'
        }]
      }
    },
    customer_profile: {
      _none: {
        fields: [{
          id: 'last_visit_date',
          label: '最後訪問日',
          data_type: 'date', //for cassandra
          default_value: Date.now()
        }]
      },
      customer_profile: {
        id: 'customer_profile',
        label: '客戶屬性',
        fields: [{
          id: 'gender',
          label: '性別',
          data_type: 'refOption', //for cassandra
          ref: 'gender',
          default_value: 'M'
        }, {
          id: 'age',
          label: '年紀',
          data_type: 'number'
        }]
      },
      interaction: {
        id: 'inter_action',
        label: '互動狀態',
        fields: [{
          id: 'lexus',
          label: 'LEXUS保有台數',
          data_type: 'number'
        }, {
          id: 'toyota',
          label: 'TOYOTA保有台數',
          data_type: 'number'
        }]
      }
    },
    vehicle_condition: {
      _none: {
        fields: [{
          id: 'regular_recall',
          label: '每年連續回廠定保',
          data_type: 'refOption',
          ref: 'booleanYN',
          default_value: 'Y'
        }, {
          id: 'purpose',
          label: '類別',
          data_type: 'refOption',
          ref: 'carPurpose',
          default_value: '2'
        }]
      }
    },
    details: {
      point: {
        id: 'point',
        label: '點數明細',
        fields: [{
          id: 'exchange_date',
          label: '兌換日期',
          default_value: Date.now(),
          data_type: 'date'
        }, {
          id: 'exchange_price',
          label: '兌換金額',
          default_value: 2,
          data_type: 'number'
        }]
      },
      insurance: {
        id: 'point',
        label: '點數明細',
        fields: [{
          id: 'exchange_date',
          label: '兌換日期',
          default_value: Date.now(),
          data_type: 'date'
        }, {
          id: 'exchange_price',
          label: '兌換金額',
          default_value: 2,
          data_type: 'number'
        }]
      }
    },
    footprint: {
      vehicle: {
        id: 'vehicle',
        label: '足跡',
        fields: [{
          id: 'product',
          label: '車款',
          default_value: 10,
          data_type: 'number',
        }, {
          id: 'calculation',
          label: '購車試算',
          default_value: 5,
          data_type: 'number',
        }]
      }
    }
  },
  tag_pools: {
    event: {
      id: 'event',
      label: '活動名單標籤',
      tags: [{
        id: 123,
        label: '2016TOYOTA玩具愛分享'
      },{
        id: 234,
        label: '2017TOYOTA玩具愛分享'
      }]
    },
    media: {
      id: 'media',
      label: '自有媒體標籤',
      tags: [{
        id: 456,
        label: 'Camery'
      },{
        id: 567,
        label: 'Altis'
      }]
    },
    interesting: {
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
  },
  criteria: {
    preferred_target: [
      { //自訂名單下載
        key: shortid.generate(),
        type: 'combo',  //combo, refDetails, field, bundle, tag, footprint
        operator: 'or',  //and, or, eq, ne, lt, le, gt, ge, not
        criteria: [{
          key: shortid.generate(),
          type: 'field',
          cate: null,
          id: 'last_visit_date',
          label: '最近訪問日',
          value: Date.now(),
          data_type: 'date',
          operator: 'lt'
        }, {
          key: shortid.generate(),
          type: 'bundle',
          operator: 'and',
          criteria: [{
            key: shortid.generate(),
            type: 'field',
            cate: 'customer_profile',
            id: 'age',
            label: '年紀',
            value: 40,
            data_type: 'number',
            operator: 'lt'
          }, {
            key: shortid.generate(),
            type: 'field',
            cate: 'interaction',
            id: 'toyota',
            label: 'TOYOTA保有台數',
            value: 2,
            data_type: 'number',
            operator: 'gt'
          }]
        }]
      }
    ],
    customer_profile: [
      { //顧客屬性條件
        consumer: 'holder', //holder: 使用人  owner: 領照人  contact: 聯絡人
        criteria: {
          key: shortid.generate(),
          type: 'combo',  //combo, refDetails, field, bundle, tag, footprint
          operator: 'or',  //and, or, eq, ne, lt, le, gt, ge, not
          criteria: [{
            key: shortid.generate(),
            type: 'field',
            cate: null,
            id: 'last_visit_date',
            label: '最近訪問日',
            value: Date.now(),
            data_type: 'date',
            operator: 'lg'
          }, {
            key: shortid.generate(),
            type: 'bundle',
            operator: 'and',
            criteria: [{
              key: shortid.generate(),
              type: 'field',
              cate: 'customer_profile',
              id: 'age',
              label: '年紀',
              value: 40,
              data_type: 'number',
              operator: 'lt'
            }, {
              key: shortid.generate(),
              type: 'field',
              cate: 'interaction',
              id: 'toyota',
              label: 'TOYOTA保有台數',
              value: 2,
              data_type: 'number',
              operator: 'gt'
            }]
          }]
        }
      }
    ], //顧客屬性條件 end
    vehicle_condition: [
      {  //車輛屬性資料
        key: shortid.generate(),
        type: 'combo',
        operator: 'and',
        criteria: [{
          key: shortid.generate(),
          type: 'field',
          id: 'regular_recall',
          label: '每年連續回廠定保',
          value: 'Y',
          data_type: 'refOption',
          value_label: '是',
          operator: 'eq'
        }, {
          key: shortid.generate(),
          type: 'field',
          id: 'purpose',
          label: '類別',
          value: '2',
          data_type: 'refOption',
          value_label: '一般自用',
          operator: 'gt'
        }]
      }, {
        key: shortid.generate(),
        type: 'combo',
        operator: 'not',
        criteria: [{
          key: shortid.generate(),
          type: 'field',
          id: 'regular_recall',
          label: '每年連續回廠定保',
          value: 'Y',
          data_type: 'refOption',
          value_label: '是',
          operator: 'eq'
        }, {
          key: shortid.generate(),
          type: 'field',
          id: 'purpose',
          label: '類別',
          value: '1',
          data_type: 'refOption',
          value_label: '一般自用',
          operator: 'gt'
        }]
      }
    ],  //車輛屬性資料 end
    details: [
      { //明細資料指定條件
        key: shortid.generate(),
        type: 'combo',
        operator: 'and',
        criteria: [{
          key: shortid.generate(),
          type: 'refDetails',
          operator: 'and',
          ref: 'point',
          ref_label: '點數明細',
          criteria: [{
            key: shortid.generate(),
            type: 'field',
            id: 'exchange_date',
            label: '兌換日期',
            value: Date.now(),
            data_type: 'date',
            operator: 'ge'
          }, {
            key: shortid.generate(),
            type: 'field',
            id: 'exchange_price',
            label: '兌換金額',
            value: 2,
            data_type: 'number',
            operator: 'ge'
          }]
        }, {
          key: shortid.generate(),
          type: 'refDetails',
          operator: 'or',
          ref: 'point',
          ref_label: '點數明細',
          criteria: [{
            key: shortid.generate(),
            type: 'field',
            id: 'exchange_date',
            label: '兌換日期',
            value: Date.now(),
            data_type: 'date',
            operator: 'ge'
          }, {
            key: shortid.generate(),
            type: 'field',
            id: 'exchange_price',
            label: '兌換金額',
            value: 2,
            data_type: 'number',
            operator: 'ge'
          }]
        }, {
          key: shortid.generate(),
          type: 'refDetails',
          operator: 'not',
          ref: 'point',
          ref_label: '點數明細',
          criteria: [{
            key: shortid.generate(),
            type: 'field',
            id: 'exchange_date',
            label: '兌換日期',
            value: Date.now(),
            data_type: 'date',
            operator: 'ge'
          }, {
            key: shortid.generate(),
            type: 'field',
            id: 'exchange_price',
            label: '兌換金額',
            value: 2,
            data_type: 'number',
            operator: 'ge'
          }]
        }]
      },//明細資料指定條件 end
    ],
    tags: [
      { //標籤篩選
        key: shortid.generate(),
        type: 'combo',
        operator: 'and',
        criteria: [{
          key: shortid.generate(),
          type: 'tag',
          operator: 'or',
          ref: 'event',
          ref_label: '活動名單標籤',
          criteria: [{
            key: shortid.generate(),
            tagId: 123,
            tagLabel: '2016TOYOTA玩具愛分享'
          },{
            key: shortid.generate(),
            tagId: 234,
            tagLabel: '2017TOYOTA玩具愛分享'
          }]
        }, {
          key: shortid.generate(),
          type: 'tag',
          operator: 'and',
          ref: 'media',
          ref_label: '自有媒體標籤',
          criteria: [{
            key: shortid.generate(),
            tagId: 456,
            tagLabel: 'Camery'
          },{
            key: shortid.generate(),
            tagId: 567,
            tagLabel: 'Altis'
          }]
        }, {
          key: shortid.generate(),
          type: 'tag',
          operator: 'not',
          ref: 'interesting',
          ref_label: '興趣標籤',
          criteria: [{
            key: shortid.generate(),
            tagId: 678,
            tagLabel: '拉屎菌'
          },{
            key: shortid.generate(),
            tagId: 789,
            tagLabel: '頭又大'
          }]
        }]
      },   //標籤篩選 end
    ],
    footprint: [
      {
        key: shortid.generate(),
        type: 'combo',
        operator: 'and',
        criteria: [{
          key: shortid.generate(),
          type: 'footprint',
          operator: 'gt',
          id: 'product',
          label: '車款',
          value: 10,
          data_type: 'number',
          periodFrom: Date.now(),
          periodTo: Date.now()
        }, {
          key: shortid.generate(),
          type: 'footprint',
          operator: 'gt',
          id: 'calculation',
          label: '購車試算',
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
    }]
  }
};