
module.exports = {
  up: (query, DataTypes) => {
    return query.changeColumn('dm_ElandTag', 'tagLabel', {
      type: DataTypes.STRING(100)
    });
  }
};
