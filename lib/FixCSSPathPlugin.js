'use strict';

var RawSource = require('webpack-core/lib/RawSource');
var resources = require('css-resources');
var path = require('path');

module.exports = FixCSSPathPlugin;

function FixCSSPathPlugin() {}

FixCSSPathPlugin.prototype.apply = function(compiler) {

  compiler.plugin('emit', function(compilation, callback) {
    fixCSS(compilation.assets);
    callback();
  });

};

//initAssets more info https://github.com/spmjs/spm/issues/1293
var initAssets = null;

function fixCSS(assets) {
  if (!initAssets) initAssets = assets;

  var cssFiles = Object.keys(assets).filter(function(item) {
    return /\.css$/.test(item);
  });

  cssFiles.forEach(function(cssFile) {
    var file = assets[cssFile];
    var code = resources(file.source(), function(item) {
      var newPath = resolve(item, cssFile);
      if (item.path === newPath) {
        return item.string;
      } else {
        return 'url("'+newPath+'")';
      }
    });
    assets[cssFile] = new RawSource(code);
  });

  function resolve(item, cssFile) {
    var itemPath = item.path.split('?')[0].split('#')[0];
    if (!assets[itemPath] && !initAssets[itemPath]) return item.path;

    cssFile = path.normalize(cssFile);

    var len = cssFile.split('/').length;
    if (len <= 1) return item.path;
    return new Array(len).join('../') + item.path;
  }
}

