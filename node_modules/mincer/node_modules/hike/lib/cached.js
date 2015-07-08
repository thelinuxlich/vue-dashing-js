/** internal
 *  class Cached
 *
 *  Cached variant of [[Hike]]. It assumes the file system does not change
 *  between `find` calls. All `stat` and `entries` calls are cached for the
 *  lifetime of the [[Cached]] object.
 **/

'use strict';

var shared = require('./shared');

////////////////////////////////////////////////////////////////////////////////

// clone extension aliases
function cloneAliases(trail) {
  var copy = {};

  Object.keys(trail.__aliases__).forEach(function (extension) {
    copy[extension] = [].concat(trail.__aliases__[extension]);
  });

  return copy;
}

////////////////////////////////////////////////////////////////////////////////

var Cached = module.exports = function Cached(trail) {
  this.__root__       = '' + trail.__root__;
  this.__paths__      = [].concat(trail.__paths__);
  this.__extensions__ = [].concat(trail.__extensions__);
  this.__aliases__    = cloneAliases(trail);
  this.__patterns__   = {};
  this.__entries__    = {};
  this.__stats__      = {};
};

// Base Properties and Functions ///////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

/**
 *  Cached#root -> String
 *
 *  Returns hike's root.
 **/
Object.defineProperty(Cached.prototype, 'root', {
  get: function () { return '' + this.__root__; }
});

/**
 *  Cached#paths -> Array
 *
 *  Returns array of registered lookup paths.
 **/
Object.defineProperty(Cached.prototype, 'paths', {
  get: function () { return [].concat(this.__paths__); }
});

/**
 *  Cached#extensions -> Array
 *
 *  Returns array of registered lookup extensions.
 **/
Object.defineProperty(Cached.prototype, 'extensions', {
  get: function () { return [].concat(this.__extensions__); }
});

/**
 *  Cached#stat(pathname) -> fs.Stats | undefined
 *  - pathname(String): Pathname to get stats for.
 *
 *  See [[Hike#stat]] for details.
 **/
Cached.prototype.stat = function (pathname) {
  if (!this.__stats__.hasOwnProperty(pathname)) {
    this.__stats__[pathname] = shared.stat(pathname);
  }

  return this.__stats__[pathname];
};

/**
 *  Cached#entries(pathname) -> Array
 *  - pathname(String): Pathname to get files list for.
 *
 * See [[Hike#entries]] for details.
 **/
Cached.prototype.entries = function (pathname) {
  if (!this.__entries__.hasOwnProperty(pathname)) {
    this.__entries__[pathname] = shared.entries(pathname);
  }

  return this.__entries__[pathname];
};

/**
 *  Cached#find(logicalPaths[, options, callback]) -> String | undefined
 *  - logicalPaths(String | Array): One or many (fallbacks) logical paths.
 *  - options (Object): Options hash. See description below.
 *  - callback (Function): Function to execute on each matching path. See description below.
 *
 * See [[Hike#find]] for details.
 **/
Cached.prototype.find = shared.find;
