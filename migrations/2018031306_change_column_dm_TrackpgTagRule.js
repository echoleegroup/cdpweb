
module.exports = {
  up: (query, DataTypes) => {
    return query.removeColumn('dm_TrackpgTagRule', 'tagID');
  }
};
