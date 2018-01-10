const _ = require('lodash');
const Q = require('q');
const shortid = require('shortid');

const FOLDER_MODEL_TEMPLATE = {
  type: 'folder',
  id: undefined,
  label: undefined,
  fields: []
};

const FIELD_MODEL_TEMPLATE = {
  type: 'field',
  id: undefined,
  label: undefined,
  data_type: 'text', //num, text, date, refOption
  ref: undefined, //for data_type: refOption
  default_value: undefined  //for refOption, set default value as array object, e.g. default_value: ['M']
};

const FIELD_REF_OPTIONS_TEMPLATE = {
  refCode: undefined,
  optCode: undefined,
  label: undefined,
  seq: '0'
};

const FEATURE_DATATYPE_TO_INPUT_TYPE = {
  char: "text",
  int: "number",
  float: "number",
  date: "date",
  datetime: "date"
};

const REF_FIELD_DATA_TYPE = 'refOption';
const LABEL_UNFOLDED= '未分類';

const FieldModeWrapper = (rawField) => {
  // set data_type properties
  let dataTypeProperties = {
    data_type: FEATURE_DATATYPE_TO_INPUT_TYPE[rawField.codeGroup]
  };
  if (!_.isEmpty(rawField.codeGroup)) {
    dataTypeProperties = {
      data_type: REF_FIELD_DATA_TYPE,
      ref: rawField.codeGroup
    };
    //save ref to fetch options latter
    //fieldRefs.push(rawField.codeGroup);
  }

  // to complete field model
  return Object.assign({}, FIELD_MODEL_TEMPLATE, dataTypeProperties, {
    id: rawField.featID,
    label: rawField.featName
  });
};

module.exports = {
  criteriaFeaturesToFields: (rawFields, foldingTree) => {
    let foldingFields = foldingTree.reduce((foldingFields, node) => {
      if ('ROOT' === node.parentID) { // virtual node: folder
        //create a folder model
        let folderModel = Object.assign({}, FOLDER_MODEL_TEMPLATE, {
          id: node.nodeID,
          label: node.nodeName
        });

        // extract all the raw fields, who's featID is referenced to node's nodeID
        // and its parentID references to current folder node
        _.remove(rawFields, (rawField) => {
          return _.findIndex(foldingTree, {
            nodeID: rawField.featID,
            parentID: node.nodeID
          }) > -1;
        }).reduce((fieldSet, rawField) => {
          let wrappedField = FieldModeWrapper(rawField); //produce wrapped field via rawField.
          fieldSet.push(wrappedField);  //push wrapped field to the current folder filed set.

          return fieldSet;
        }, folderModel.fields);

        foldingFields.push(folderModel);  //push current folder model to result set
      } else {
        // ignore fields
      }
      return foldingFields; //return and reduce to next node
    }, []);

    //put all un-folded field to an virtual node
    if(rawFields.length > 0) {
      //create a folder model
      let folderModel = Object.assign({}, FIELD_MODEL_TEMPLATE, {
        id: shortid.generate(),
        label: LABEL_UNFOLDED
      });
      //push all un-folded field in this virtual node.
      //** use ... to spread the rawFields array
      folderModel.fields.push(...rawFields);
      foldingFields.push(folderModel);
    }

    return foldingFields;
  },
  codeGroupToRefFields: (codeGroupDict) => {
    //rename code group properties for frontend
    return _.reduce(codeGroupDict, (fieldRefs, codeGroupBody, key) => {
      fieldRefs[key] = Object.assign({}, FIELD_REF_OPTIONS_TEMPLATE, {
        refCode: codeGroupBody.codeGroup,
        optCode: codeGroupBody.codeValue,
        label: codeGroupBody.codeLabel,
        seq: '0'
      });
      return fieldRefs;
    }, {});
  }
};

