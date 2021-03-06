const OPERATOR_DICT = {
  and: '全部',
  or: '任一',
  not: '皆不',
  eq: '=',
  ne: '≠',
  lt: '<',
  le: '<=',
  gt: '>',
  ge: '>=',
  in: '無資料',
  nn: '有資料'
};

const CRITERIA_COMPONENT_DICT = {
  COMBO: 'combo',
  BUNDLE: 'bundle',
  TRANSACTION: 'refTransaction',
  TAG: 'refTag',
  TRAIL_PERIOD: 'refTrailPeriod',
  TRAIL_HIT: 'refTrailHit',
  FIELD: 'field',
  FIELD_TAG: 'fieldTag',
  FIELD_TRAIL_TAG: 'fieldTrailTag'
};

export {OPERATOR_DICT, CRITERIA_COMPONENT_DICT}