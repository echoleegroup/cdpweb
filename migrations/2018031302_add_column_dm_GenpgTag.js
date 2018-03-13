
module.exports = {
  up: (query, DataTypes) => {
    return query.addColumn('dm_GenpgTag', 'crtTime', {
      type: DataTypes.DATE
    });
  }
};
