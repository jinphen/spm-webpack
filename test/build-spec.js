'use strict';

var join = require('path').join;
var thunkify = require('thunkify');
var rimraf = require('rimraf');
var glob = require('glob');
var fs = require('fs');

var fixtures = join(__dirname, 'fixtures');
var dest = join(fixtures, 'tmp');
var build = thunkify(function(opts, done) {
  require('../lib/build')(opts, done);
});

describe('lib/build.js', function() {

  afterEach(function(done) {
    rimraf(dest, done);
  });

  it('js entry', function*() {
    yield build({
      cwd: join(fixtures, 'js-entry'),
      dest: dest
    });
    assert(dest, 'js-entry');
  });

  it('js entry umd', function*() {
    yield build({
      cwd: join(fixtures, 'js-entry'),
      dest: dest,
      umd: 'Foo'
    });
    assert(dest, 'js-entry-umd');
  });

  it('js entry with no package.json', function*() {
    yield build({
      cwd: join(fixtures, 'js-entry-no-pkg'),
      dest: dest,
      entry: ['a.js']
    });
    assert(dest, 'js-entry-no-pkg');
  });

  it('global', function*() {
    yield build({
      cwd: join(fixtures, 'global'),
      dest: dest
    });
    assert(dest, 'global');
  });

  it('require css', function*() {
    yield build({
      cwd: join(fixtures, 'require-css'),
      dest: dest
    });
    assert(dest, 'require-css');
  });

  it('require css extract', function*() {
    yield build({
      cwd: join(fixtures, 'require-css'),
      dest: dest,
      extractCSS: true
    });
    assert(dest, 'require-css-extract');
  });

  it('jsx', function*() {
    yield build({
      cwd: join(fixtures, 'jsx'),
      dest: dest
    });
    assert(dest, 'jsx');
  });

});

function assert(actual, expect) {
  expect = join(fixtures, '../expected', expect);
  glob.sync('**/*', {cwd: actual})
    .forEach(function(file) {
      var filepath = join(actual, file);
      if (fs.statSync(filepath).isFile()) {
        var c = fs.readFileSync(filepath).toString();
        var ec = fs.readFileSync(join(expect, file)).toString();

        // Clean local user path
        var cwd = process.cwd();
        var re = new RegExp(cwd, 'g');
        if (c.indexOf(cwd) > -1) {
          c = c.replace(re, '');
          ec = ec.replace(re, '');
        }

        c.should.eql(ec);
      }
    });
}
