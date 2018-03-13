
module.exports = {
  up: (query, DataTypes) => {
    return query.changeColumn('dm_ApppgTag', 'tagLabel', {
      type: DataTypes.STRING(100)
    });
  }
};
