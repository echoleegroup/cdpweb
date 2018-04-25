import url from 'url';

(function ($) {
  let internalAjax = $.ajax;

  $.ajax = (options) => {
    options.statusCode = {
      401: () => {
        let url_pathname = url.parse(window.location.href, true, true).pathname;
        location.href = '/login?redirectURL=' + url_pathname;
      }
    };
    return internalAjax(options);
  };
})(jQuery);