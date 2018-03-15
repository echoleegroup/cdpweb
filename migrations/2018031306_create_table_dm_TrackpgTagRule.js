
module.exports = {
  up: (query, DataTypes) => {
    return query.dropTable('dm_TrackpgTagRule').then(() => {
      return query.createTable('dm_TrackpgTagRule', {
        ruleID: {
          type: DataTypes.BIGINT,
          autoIncrement: true,
          primaryKey: true
        },
        tagID: {
          type: DataTypes.BIGINT
        },
        ruleType: {
          type: DataTypes.STRING(20)
        },
        rules: {
          type: DataTypes.STRING(1000)
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

    return query.removeColumn('dm_TrackpgTagRule', 'tagID');
  }
};
