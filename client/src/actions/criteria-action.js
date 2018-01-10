const CriteriaAction = {};

CriteriaAction.getCriteriaFieldsData = (url, callback) => {
  $.ajax({
    url: url,
    method: 'get'
  }).done((result) => {
    (result.code === 200)?
      callback(null, result.data):
      callback(result.message);
  }).fail((err) => {
    callback(err);
  });
};

CriteriaAction.getCriteriaHistory = (url, callback) => {
  $.ajax({
    url: url,
    method: 'get'
  }).done((result) => {
    (result.code === 200)?
      callback(null, result.data):
      callback(result.message);
  }).fail((err) => {
    callback(err);
  });
};

export default CriteriaAction;