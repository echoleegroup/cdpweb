import Rx from 'rxjs';

const Action = {};
const _AJAX = (options, callback) => {
  $.ajax(options).done(result => {
    (result.code < 300)?
      callback(null, result.data):
      callback(result.message);
  }).fail((err) => {
    callback(err);
  });
};

Action.ajaxGet = (url, data = {}, options = {}, callback) => {
  _AJAX(Object.assign(options, {
    url: url,
    type: 'GET',
    dataType: options.dataType || 'json',
    data: data
  }), callback);
};

Action.ajaxGetObservable = Rx.Observable.bindNodeCallback(Action.ajaxGet);

Action.ajaxPut = (url, data = {}, options = {}, callback) => {
  _AJAX(Object.assign(options, {
    url: url,
    type: 'PUT',
    contentType: options.contentType || "application/json",
    dataType: options.dataType || 'json',
    data: data
  }), callback);
};

Action.ajaxPutObservable = Rx.Observable.bindNodeCallback(Action.ajaxPut);

Action.ajaxPost = (url, data = {}, options = {}, callback) => {
  _AJAX(Object.assign(options, {
    url: url,
    type: 'POST',
    contentType: options.contentType || "application/json",
    dataType: options.dataType || 'json',
    data: JSON.stringify(data)
  }), callback);
};

Action.ajaxPostObservable = Rx.Observable.bindNodeCallback(Action.ajaxPost);

export default Action;