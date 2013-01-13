/**
 * Copyright (c) 2012 Andreas Madsen
 * MIT License
 */

var fs = require('fs');
var url = require('url');
var http = require('http');
var path = require('path');
var filed = require('filed');
var domstream = require('domstream');
var querystring = require('querystring');

// Create a testing server
module.exports = function(files, settings) {

  var server = http.createServer();

  function sendhtml(content) {
    return function () {
      this.res.writeHead(200, {'Content-Type': 'text/html'});
      this.res.end(content);
    };
  }

  // Route framework files
  var mochaCorePath = path.resolve( path.dirname(require.resolve('mocha')), 'mocha.js');
  var mochaStylePath = path.resolve( path.dirname(require.resolve('mocha')), 'mocha.css');
  var chaiPath = path.resolve( path.dirname(require.resolve('chai')), 'chai.js');
  var blowPath = path.resolve( path.dirname(module.filename), 'script.js');

  // creates a map between a shared relative filepath and the absolute filepath
  var fileMap = createFileMap(files);

  // Standart output
  var base = preGenerate(settings.index, settings.style);

  //Generate pages
  var indexFile = generateIndex(base, fileMap);

  // Resolve the path that static files are relative to
  var staticRoot = path.dirname(settings.index);

  server.on('request', function (req, res) {
    var href = url.parse(req.url, true);

    res.setHeader('Access-Control-Allow-Origin', '*');

    if (href.pathname === '/') {
      res.writeHead(200, {'Content-Type': 'text/html'});
      res.end(indexFile);
    }

    else if (href.pathname === '/file/mocha.js') {
      req.pipe(filed(mochaCorePath)).pipe(res);
    } else if (href.pathname === '/file/mocha.css') {
      req.pipe(filed(mochaStylePath)).pipe(res);
    } else if (href.pathname === '/file/chai.js') {
      req.pipe(filed(chaiPath)).pipe(res);
    } else if (href.pathname === '/file/blow.js') {
      req.pipe(filed(blowPath)).pipe(res);
    }

    else if (href.pathname.indexOf('/test/') === 0) {
      req.pipe(filed( fileMap[ href.pathname.slice('/test'.length)] )).pipe(res);
    }

    else if (href.pathname === '/static') {
      // yes, this so unsafe that it is hard to understand
      // but wtf, it is just a testsuite
      req.pipe( filed(path.resolve(staticRoot, href.query.src)) ).pipe(res);
    }

    else if (fileMap.hasOwnProperty(href.pathname)) {
      res.writeHead(200, {'Content-Type': 'text/html'});
      res.end(generateTest(base, href.pathname));
    }

    else {
      res.writeHead(404, {'Content-Type': 'text/html'});
      res.end();
    }
  });

  // route all subtest pages
  server.listen(settings.port, settings.address, function () {
    var addr = server.address();
    console.log('blow server online at http://' + addr.address + ':' + addr.port);
  });
};

function createFileMap(files) {
  // find the shared dirname
  files = files.map(function (relative) {
    return path.resolve(relative);
  });

  var root = path.dirname(files[0]), i, l;
  for (i = 1, l = files.length; i < l; i++) {
    var testDir = path.dirname(files[i]);

    while (root !== testDir) {
      root = path.dirname(root);
      testDir = path.dirname(testDir);
    }
  }

  // create path map, the map will transform shortpath to realpath
  var map = {};
  for (i = 0, l = files.length; i < l; i++) {
    map[ files[i].slice(root.length) ] = files[i];
  }

  return map;
}

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
  var scripts = base.find().elem('script').toArray();
  scripts.forEach(function (node) {
    if (node.hasAttr('src') === false) return;

    var href = url.parse(node.getAttr('src'));
    if (href.protocol) return;

    node.setAttr('src', '/static?src=' + querystring.escape(node.getAttr('src')));
  });

  // insert framework files
  title.insert('afterend',
    '<link rel="stylesheet" href="/file/mocha.css">' +
    '<script src="/file/chai.js"></script>' +
    '<script src="/file/mocha.js"></script>' +
    '<script src="/file/blow.js"></script>' +
    '<script>mocha.setup("' + style + '")</script>');

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
