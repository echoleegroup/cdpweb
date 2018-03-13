
module.exports = {
  up: (query, DataTypes) => {
    return query.dropTable('dm_EvtpgTag').then(() => {
      return query.createTable('dm_EvtpgTag', {
        evtpgID: {
          type: DataTypes.STRING(20),
          primaryKey: true,
          allowNull: false
        },
        tagID: {
          type: DataTypes.BIGINT,
          autoIncrement: true,
          primaryKey: true,
          allowNull: false
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
  }
};
