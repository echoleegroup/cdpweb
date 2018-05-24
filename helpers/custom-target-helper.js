module.exports.get_mdListScoreCustomizer = () => {
  return () => {
    return {
      select: 'detail.mdListScore AS _mdListScore',
      from: '',
      where: '',
      parameters: []
    };
  }
}