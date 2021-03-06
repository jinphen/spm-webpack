'use strict';

var join = require('path').join;
var exists = require('fs').existsSync;
var stat = require('fs').statSync;
var uniq = require('uniq');
var glob = require('glob');
var extname = require('path').extname;
var log = require('spm-log');

module.exports = function(cwd, pkg) {
  var files = [];

  if (!pkg.spm) {
    log.error('error', '`spm` is not found in package.json');
  }

  if (exists(join(cwd, pkg.spm.main || 'index.js'))) {
    files.push((pkg.spm.main || 'index.js').replace(/^\.\//g, ''));
  }

  if (pkg.spm.output && !Array.isArray(pkg.spm.output)) {
    log.error('error', '`output` in package.json is not a type of Array');
  }

  (pkg.spm.output || []).forEach(function(pattern) {
    var items = glob.sync(pattern, {cwd: cwd});
    items.forEach(function(item) {
      if (stat(join(cwd, item)).isFile()) {
        files.push(item);
      }
    });
  });

  return map(uniq(files), cwd, pkg);
};

function map(files, cwd) {
  var js = {};
  var other = [];
  var prefix = ''; //utils.getPrefix(pkg);
  var extractCSS = false;
  files.forEach(function(file) {
    var absFile = join(cwd, file);
    var ext = extname(file);
    if (ext === '.js' || ext === '.coffee' || ext === '.jsx') {
      js[prefix + file.replace(ext, '')] = absFile;
    } else if (ext === '.css') {
      // Create js file to require css
      var fileName = '_webpackcssentry_' + require('path').basename(file.replace(/\//g, '^'), '.css');
      var jsFile = join(require('os').tmpdir(), fileName + '.js');
      var content = 'require("'+absFile+'");';
      require('fs').writeFileSync(jsFile, content, 'utf-8');
      js[fileName] = jsFile;
      extractCSS = true;
    } else {
      other.push(file);
    }
  });
  return {js:js,extractCSS:extractCSS,other:other};
}
