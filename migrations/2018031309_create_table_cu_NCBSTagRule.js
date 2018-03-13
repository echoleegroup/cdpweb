
module.exports = {
  up: (query, DataTypes) => {
    return query.createTable('cu_NCBSTagRule', {
      ruleID: {
        type: DataTypes.BIGINT,
        autoIncrement: true,
        primaryKey: true
      },
      tagID: {
        type: DataTypes.BIGINT
      },
      tagLabel: {
        type: DataTypes.STRING(100)
      },
      isDel: {
        type: DataTypes.STRING(1)
      },
      crtTime: {
        type: DataTypes.DATE
      },
      updTime: {
        type: DataTypes.DATE
      },
      updUser: {
        type: DataTypes.STRING(20)
      }
    })
  }
};
