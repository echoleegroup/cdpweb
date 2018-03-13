
module.exports = {
  up: (query, DataTypes) => {
    return query.addColumn('dm_EvtpgTag', 'crtTime', {
      type: DataTypes.DATE
    });
  }
};
