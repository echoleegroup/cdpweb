
module.exports = {
  up: (query, DataTypes) => {
    return query.dropTable('dm_GenpgTag').then(() => {
      return query.createTable('dm_GenpgTag', {
        genpgID: {
          type: DataTypes.BIGINT,
          primaryKey: true,
          allowNull: false
        },
        tagID: {
          type: DataTypes.BIGINT,
          primaryKey: true,
          allowNull: false,
          autoIncrement: true
        },
        tagLabel: {
          type: DataTypes.STRING(100)
        },
        tagSource: {
          type: DataTypes.STRING(1)
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
      });
    });

    return query.addColumn('dm_GenpgTag', 'crtTime', {
      type: DataTypes.DATE
    });
  }
};
