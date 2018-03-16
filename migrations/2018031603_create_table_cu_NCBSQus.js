
module.exports = {
  up: (query, DataTypes) => {
    return query.createTable('cu_NCBSQus', {
      ncbsQus: {
        type: DataTypes.STRING(20),
        primaryKey: true
      },
      ncbsQusName: {
        type: DataTypes.STRING(100)
      },
      ncbsDesc: {
        type: DataTypes.STRING(200)
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
