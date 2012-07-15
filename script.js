
(function () {
  var stack = [];
  
  window.ready = function (fn) {
    return function () {
      stack.push(fn);
    };
  };
  
  window.onload = function () {
    for (var i = 0, l = stack.length; i < l; i++) {
      stack[i]();
    }
    
    window.mocha.run();
  };
})();
