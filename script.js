
(function () {
  var ready = [];

  window.blow = {
    readyBind: function (fn) {
      return function () {
        ready.push(fn);
      };
    },

    ready: function (fn) {
      ready.push(fn);
    }
  };

  window.onload = function () {
    (function loop(i) {
      // the ready stack has been executed
      if (i < 0) {
        window.mocha.run();
        return;
      }

      var fn = ready[i];

      // no callback applyed, treat as sync
      if (fn.length === 0) {
        return loop(i - 1);
      }

      // callback applyed, treat as async
      fn(function () {
        loop(i - 1);
      });
    })(ready.length - 1);
  };
})();
