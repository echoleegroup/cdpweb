
module.exports = {
  up: (query, DataTypes) => {
    return query.addColumn('dm_TrackpgTagRule', 'ruleID', {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true
    }).then(() => {
      return query.addColumn('dm_TrackpgTagRule', 'tagID', {
        type: DataTypes.BIGINT
      });
    });
  }
};
