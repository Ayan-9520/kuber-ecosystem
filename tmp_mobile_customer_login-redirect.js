(function () {
  function maybeGoHome(url, status) {
    if (status < 200 || status >= 300) return;
    var u = String(url || '');
    if (u.indexOf('/auth/verify-otp') === -1 && u.indexOf('/auth/login') === -1) return;
    setTimeout(function () {
      if (/\/login/i.test(location.pathname) || /\/OtpLogin/i.test(location.pathname)) {
        location.replace('/Home/Dashboard');
      }
    }, 600);
  }
  if (window.fetch) {
    var ofetch = window.fetch;
    window.fetch = function () {
      var args = arguments;
      var req = args[0];
      var url = typeof req === 'string' ? req : (req && req.url) || '';
      return ofetch.apply(this, args).then(function (res) {
        maybeGoHome(url, res.status);
        return res;
      });
    };
  }
  var open = XMLHttpRequest.prototype.open;
  var send = XMLHttpRequest.prototype.send;
  XMLHttpRequest.prototype.open = function (method, url) {
    this.__kuberUrl = url;
    return open.apply(this, arguments);
  };
  XMLHttpRequest.prototype.send = function () {
    var xhr = this;
    xhr.addEventListener('load', function () {
      maybeGoHome(xhr.__kuberUrl, xhr.status);
    });
    return send.apply(this, arguments);
  };
})();
