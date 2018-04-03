import Rx from 'rxjs';
import {assign} from 'lodash';

const _AJAX = (options, callback) => {
  $.ajax(options).done(result => {
    (result.code < 300)?
      callback(null, result.data):
      callback(result.message);
  }).fail((err) => {
    callback(err);
  });
};

const ajaxGet = (url, data = {}, options = {}, callback) => {
  _AJAX(assign(options, {
    url: url,
    type: 'GET',
    dataType: options.dataType || 'json',
    data: data
  }), callback);
};

exports.ajaxGetObservable = Rx.Observable.bindNodeCallback(ajaxGet);

const ajaxPut = (url, data = {}, options = {}, callback) => {
  _AJAX(assign(options, {
    url: url,
    type: 'PUT',
    contentType: options.contentType || "application/json",
    dataType: options.dataType || 'json',
    data: data
  }), callback);
};

exports.ajaxPutObservable = Rx.Observable.bindNodeCallback(ajaxPut);

const ajaxPost = (url, data = {}, options = {}, callback) => {
  _AJAX(assign(options, {
    url: url,
    type: 'POST',
    contentType: options.contentType || "application/json",
    dataType: options.dataType || 'json',
    data: JSON.stringify(data)
  }), callback);
};

exports.ajaxPostObservable = Rx.Observable.bindNodeCallback(ajaxPost);