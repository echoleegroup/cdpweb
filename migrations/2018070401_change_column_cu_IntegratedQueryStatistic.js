
module.exports = {
  up: (query, DataTypes) => {
    return query.changeColumn('cu_IntegratedQueryStatistic', 'standardDeviation', {
      type: DataTypes.STRING(20)
    });
  }
};
