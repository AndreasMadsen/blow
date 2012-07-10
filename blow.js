/**
 * Copyright (c) 2012 Andreas Madsen
 * MIT License
 */

var fs = require('fs');
var path = require('path');
var tako = require('tako');
var domstream = require('domstream');

module.exports = function(port, files, style) {

  var app = tako();

  var mochaCorePath = path.resolve( path.dirname(require.resolve('mocha')), 'mocha.js');
  app.route('/file/mocha.js').file(mochaCorePath);

  var mochaStylePath = path.resolve( path.dirname(require.resolve('mocha')), 'mocha.css');
  app.route('/file/mocha.css').file(mochaStylePath);

  var chaiPath = path.resolve( path.dirname(require.resolve('chai')), 'chai.js');
  app.route('/file/chai.js').file(chaiPath);

  // find the shared dirname
  var root = path.dirname(files[0]), i, l;
  for (i = 1, l = files.length; i < l; i++) {
    var testDir = path.dirname(files[i]);

    while (root !== testDir) {
      root = path.dirname(root);
      testDir = path.dirname(testDir);
    }
  }

  // create pathmap
  var map = {};
  for (i = 0, l = files.length; i < l; i++) {
    map[ files[i].slice(root.length) ] = files[i];
  }

  // route all static test files
  Object.keys(map).forEach(function (relative) {
    console.log('/test' + relative + ' = ' + map[relative]);
    app.route('/test' + relative).file(map[relative]);
  });

  //
  var indexFile = generateIndex(map, style);
  app.route('/').html(indexFile);

  // route all subtest pages
  Object.keys(map).forEach(function (relative) {
    var content = generateTest(relative, style);
    app.route(relative).html(content);
  });

  app.httpServer.listen(port, function () {
    console.log('mocha server online at http://127.0.0.1:' + port);
  });
};

// Standart output
var base = domstream( fs.readFileSync( path.resolve(path.dirname(module.filepath), 'index.html') ) );

// generate the master testsuite
function generateIndex(files, style) {
  var document = base.copy();

  // modify title
  var title = document.find().only().elem('title').toValue();
  title.setContent('Mocha Tests - all');

  // add testcases
  var head = document.find().only().elem('head').toValue();

  // set mocha style
  head.append('<script>mocha.setup("' + style + '")</script>');

  // bind testcases
  Object.keys(files).forEach(function (relative) {
    head.append('<script src="/test' + relative + '"></script>');
  });

  // bind mocha runner
  head.append('<script> window.onload = function () { mocha.run() }; </script>');

  return document.content;
}

// generate individual testcases
function generateTest(file, style) {
  var document = base.copy();

  // modify title
  var title = document.find().only().elem('title').toValue();
  title.setContent('Mocha Tests - ' + file);

  // add testcases
  var head = document.find().only().elem('head').toValue();

  // set mocha style
  head.append('<script>mocha.setup("' + style + '")</script>');

  // bind testcases
  head.append('<script src="/test' + file + '"></script>');

  // bind mocha runner
  head.append('<script> window.onload = function () { mocha.run() }; </script>');

  return document.content;
}
