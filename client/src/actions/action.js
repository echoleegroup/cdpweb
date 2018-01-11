const Action = {};
const _AJAX = (options, callback) => {
  $.ajax(options).done((result) => {
    (result.code < 300)?
      callback(null, result.data):
      callback(result.message);
  }).fail((err) => {
    callback(err);
  });
};

Action.get = (url, options, callback) => {
  _AJAX(Object.assign(options, {
    url: url,
    method: 'get',
    dataType: options.dataType || 'json'
  }), callback);
};

Action.put = (url, options, callback) => {
  _AJAX(Object.assign(options, {
    url: url,
    method: 'put',
    dataType: options.dataType || 'json'
  }), callback);
};

Action.post = (url, options, callback) => {
  _AJAX(Object.assign(options, {
    url: url,
    method: 'post',
    dataType: options.dataType || 'json'
  }), callback);
};

export default Action;