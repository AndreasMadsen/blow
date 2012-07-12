/**
 * Copyright (c) 2012 Andreas Madsen
 * MIT License
 */

var fs = require('fs');
var path = require('path');
var tako = require('tako');
var domstream = require('domstream');
var querystring = require('querystring');
var filed = require('filed');

module.exports = function(files, settings) {

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
    app.route('/test' + relative).file(map[relative]);
  });

  // Standart output
  var base = preGenerate(settings.index, settings.style);

  //Generate pages
  var indexFile = generateIndex(base, map);
  app.route('/').html(indexFile);

  // route all subtest pages
  Object.keys(map).forEach(function (relative) {
    var content = generateTest(base, relative);
    app.route(relative).html(content);
  });

  // route static requests
  var staticRoot = path.dirname(settings.index);
  app.route('/static', function (req, res) {
    // yes, this so unsafe that it is hard to understand
    // but wtf, it is just a testsuite
    req.pipe( filed(path.resolve(staticRoot, req.qs.src)) ).pipe(res);
  });

  app.httpServer.listen(settings.port, settings.address, function () {
    var addr = app.httpServer.address();
    console.log('blow server online at http://' + addr.address + ':' + addr.port);
  });
};

function preGenerate(file, style) {
  var base = domstream(fs.readFileSync(file)).live(true);

  var head = base.find().only().elem('head').toValue();
  if (!head) throw new Error('a <head> tag must exist');

  var body = base.find().only().elem('body').toValue();
  if (!body) throw new Error('a <body> tag must exist');

  // insert meta tag
  var meta = head.find().only().elem('meta').attr('charset').toValue();
  if (meta === false) {
    head.insert('afterbegin', '<meta charset="utf8">');
    meta = head.find().only().elem('meta').attr('charset').toValue();
  }

  // insert title tag
  var title = head.find().only().elem('title').toValue();
  if (title === false) {
    meta.insert('afterend', '<title></title>');
    title = head.find().only().elem('title').toValue();
  }

  // rewrite existing scripttag
  var scripts = base.find().only().elem('script').toArray();
  scripts.forEach(function (node) {
    if (node.hasAttr('src') === false) return;

    node.setAttr('src', '/static?src=' + querystring.escape(node.getAttr('src')));
  });

  // insert framework files
  title.insert('afterend',
    '<link rel="stylesheet" href="/file/mocha.css">' +
    '<script src="/file/chai.js"></script>' +
    '<script src="/file/mocha.js"></script>' +
    '<script>mocha.setup("' + style + '")</script>' +
    '<script>window.onload = function () { mocha.run() };</script>');

  // insert framework container
  var container = body.find().only().attr('id', 'mocha').toValue();
  if (container === false) {
    body.append('<div id="mocha"></div>');
  }

  return base.live(false);
}

// generate the master testsuite
function generateIndex(base, files) {
  var document = base.copy();
  var head = document.find().only().elem('head').toValue();

  // set title
  head.find()
      .only().elem('title').toValue()
      .setContent('Mocha Tests - all');

  // bind testcases
  Object.keys(files).forEach(function (relative) {
    head.append('<script src="/test' + relative + '"></script>');
  });

  return document.content;
}

// generate individual testcases
function generateTest(base, file) {
  var document = base.copy();
  var head = document.find().only().elem('head').toValue();

  // modify title
  head.find()
      .only().elem('title').toValue()
      .setContent('Mocha Tests - ' + file);

  // bind testcases
  head.append('<script src="/test' + file + '"></script>');

  return document.content;
}
