
module.exports = {
  up: (query, DataTypes) => {
    return query.createTable('dm_APPpgMst', {
      apppgID: {
        type: DataTypes.BIGINT,
        autoIncrement: true,
        primaryKey: true
      },
      client: {
        type: DataTypes.STRING(20)
      },
      funcName: {
        type: DataTypes.STRING(150)
      },
      apppgTitle: {
        type: DataTypes.STRING(300)
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
