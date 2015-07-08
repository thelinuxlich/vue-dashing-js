/**
 *  class Hike
 *
 *  Public container class for holding paths and extensions.
 **/

'use strict';

var path    = require('path');

var Cached  = require('./cached');
var shared  = require('./shared');

////////////////////////////////////////////////////////////////////////////////

function normalize(value, callback) {
  if (!value) {
    return [];
  }

  if (!Array.isArray(value)) {
    value = [ value ];
  }

  return value.map(callback);
}

function normalizeExtensions(values) {
  return normalize(values, function (extension) {
    return extension[0] === '.' ? extension : '.' + extension;
  });
}

function normalizePathnames(values, self) {
  return normalize(values, function (pathname) {
    return path.resolve(self.__root__, pathname);
  });
}

function arrayRemove(self, prop, elements) {
  var result, removed, i, l, v;

  // short-path: remove all elements
  if (elements.length === 0) {
    removed    = self[prop];
    self[prop] = [];
    return removed;
  }

  result  = [];
  removed = [];

  for (i = 0, l = self[prop].length; i < l; i++) {
    v = self[prop][i];

    if (-1 === elements.indexOf(v)) {
      result.push(v);
    } else {
      removed.push(v);
    }
  }

  self[prop] = result;
  return removed;
}

function arrayPrepend(self, prop, elements) {
  arrayRemove(self, prop, elements);
  self[prop] = elements.concat(self[prop]);
}

function arrayAppend(self, prop, elements) {
  arrayRemove(self, prop, elements);
  self[prop] = self[prop].concat(elements);
}

////////////////////////////////////////////////////////////////////////////////

/**
 *  new Hike(root = '.')
 *  - root (String): root path
 *
 *  A Hike accepts an optional root path that defaults to your
 *  current working directory. Any relative paths added to
 *  [[Hike#paths]] will be expanded relatively to the root.
 **/
var Hike = module.exports = function Hike(root) {
  this.__root__ = path.resolve(root || '.');

  // Array of lookup paths
  this.__paths__ = [];

  // Array of extensions for auto-guessing
  this.__extensions__ = [];

  // Map of `{ String<extension> : Array[String<alias>, ...] }`
  this.__aliases__ = {};

  // Filename RegExps cache
  this.__patterns__ = {};
};

// Base Properties and Functions ///////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

/**
 *  Hike#root -> String
 *
 *  Returns hike's root.
 **/
Object.defineProperty(Hike.prototype, 'root', {
  get: function () { return '' + this.__root__; }
});

/**
 *  Hike#paths -> Array
 *
 *  Returns array of registered lookup paths.
 **/
Object.defineProperty(Hike.prototype, 'paths', {
  get: function () { return [].concat(this.__paths__); }
});

/**
 *  Hike#extensions -> Array
 *
 *  Returns array of registered lookup extensions.
 **/
Object.defineProperty(Hike.prototype, 'extensions', {
  get: function () { return [].concat(this.__extensions__); }
});

/**
 *  Hike#stat(pathname) -> fs.Stats | undefined
 *  - pathname(String): Pathname to get stats for.
 *
 *  `ENOENT`-aware wraper over `fs.statSync`.
 *  Returns `undefined` if file does not exists.
 **/
Hike.prototype.stat = shared.stat;

/**
 *  Hike#entries(pathname) -> Array
 *  - pathname(String): Pathname to get files list for.
 *
 *  `ENOENT`-aware wraper over `fs.readdirSync` that filters out `.` files and
 *  `~` swap files. Returns an empty `Array` if the directory does not exist.
 **/
Hike.prototype.entries = shared.entries;

/**
 *  Hike#find(logicalPaths[, options, callback]) -> String | undefined
 *  - logicalPaths(String | Array): One or many (fallbacks) logical paths.
 *  - options (Object): Options hash. See description below.
 *  - callback (Function): Function to execute on each matching path. See description below.
 *
 *  Returns the expanded path for a logical path in the path collection.
 *
 *      trail = new Hike("/home/ixti/Projects/hike-js");
 *
 *      trail.appendExtensions([".js"]);
 *      trail.appendPaths(["lib", "test"]);
 *
 *      trail.find("hike");
 *      // -> "/home/ixti/Projects/hike-js/lib/hike.js"
 *
 *      trail.find("test_hike");
 *      // -> "/home/ixti/Projects/hike-js/test/test_hike.js"
 *
 *  `find` accepts multiple fallback logical paths that returns the
 *  first match.
 *
 *      trail.find(["hike", "hike/index"]);
 *
 *  is equivalent to
 *
 *      trail.find("hike") || trail.find("hike/index");
 *
 *  Though `find` always returns the first match, it is possible
 *  to iterate over all shadowed matches and fallbacks by supplying
 *  a `callback`:
 *
 *      trail.find(["hike", "hike/index"], function (pathname) {
 *        console.warn(pathname);
 *      });
 *
 *  This allows you to filter your matches by any condition.
 *
 *      trail.find("application", function (pathname) {
 *        if ("text/css" == mime_type_for(pathname)) {
 *          // stop iteration and return matched pathname
 *          return true;
 *        }
 *      });
 *
 *  #### Options
 *
 *  - **basePath** (String): You can specify "alternative" _base path_ to be
 *    used upon searching. Default: [[Hike#root]].
 *
 *  #### Callback
 *
 *  Iterator that is called on each matching pathname.
 *
 *  It receives matching `pathname` and must return `true`-ish value in order to
 *  stop iteration and return given `pathname` as result of search.
 *
 *
 *  ###### Default:
 *
 *      function (pathname) { return true; }
 **/
Hike.prototype.find = shared.find;

/**
 *  Hike#cached -> Cached
 *
 *  A [[Cached]] is a cached [[Hike]] object that caches FS ops.
 *  If you are confident that you are not making changes the paths you are
 *  searching, cached version will avoid excess system calls.
 *
 *      var cached = trail.cached;
 *
 *      cached.find("hike/trail"); // hits FS
 *      cached.find("hike/trail"); // returns cached result
 *      cached.find("test_trail"); // hits FS
 **/
Object.defineProperty(Hike.prototype, 'cached', {
  get: function () { return new Cached(this); }
});

// Lookup Paths ////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

/**
 *  Hike#prependPaths(pathnames) -> void
 *  - pathnames (Array): paths to prepend
 *
 *  Prepends `pathnames` to the list of lookup paths.
 **/
Hike.prototype.prependPaths = function prependPaths(pathnames) {
  // reset regexps cache
  this.__patterns__ = {};

  arrayPrepend(this, '__paths__', normalizePathnames(pathnames, this));
};

/**
 *  Hike#appendPaths(pathnames) -> void
 *  - pathnames (Array): paths to append
 *
 *  Appends `pathnames` to the list of lookup paths.
 **/
Hike.prototype.appendPaths = function appendPaths(pathnames) {
  // reset regexps cache
  this.__patterns__ = {};

  arrayAppend(this, '__paths__', normalizePathnames(pathnames, this));
};

/**
 *  Hike#removePath([pathnames]) -> Array
 *  - pathnames (Array): paths to remove
 *
 *  Removes `pathnames` from the list of lookup paths.
 *  If no `pathnames` given (or an empty array), then all registered lookup
 *  paths are removed.
 *
 *  Returns list of removed pathnames.
 **/
Hike.prototype.removePaths = function removePaths(pathnames) {
  // reset regexps cache
  this.__patterns__ = {};

  return arrayRemove(this, '__paths__', normalizePathnames(pathnames, this));
};

// Lookup Extensions ///////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

/**
 *  Hike#prependExtensions(extensions) -> void
 *  - extensions (Array): extensions to prepend
 *
 *  Prepends `extensions` to the list of lookup extensions.
 **/
Hike.prototype.prependExtensions = function prependExtensions(extensions) {
  // reset regexps cache
  this.__patterns__ = {};

  arrayPrepend(this, '__extensions__', normalizeExtensions(extensions));
};

/**
 *  Hike#appendExtensions(extensions) -> void
 *  - extensions (Array): extensions to append
 *
 *  Appends `extensions` to the list of lookup extensions.
 **/
Hike.prototype.appendExtensions = function appendExtensions(extensions) {
  // reset regexps cache
  this.__patterns__ = {};

  arrayAppend(this, '__extensions__', normalizeExtensions(extensions));
};

/**
 *  Hike#removeExtension([extensions]) -> Array
 *  - extensions (Array): extensions to remove
 *
 *  Removes `extensions` from the list of lookup extensions.
 *  If no `extensions` given (or an empty array), then all registered lookup
 *  extensions are removed.
 *
 *  Returns list of removed extensions.
 **/
Hike.prototype.removeExtensions = function removeExtensions(extensions) {
  // reset regexps cache
  this.__patterns__ = {};

  return arrayRemove(this, '__extensions__', normalizeExtensions(extensions));
};

// Extension Aliases ///////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

/**
 * Hike#aliasExtension(extension, aliases) -> void
 * - extension (String): base extension
 * - aliases (String, Array): alias or multiple aliases of base
 *   extension
 *
 * Registers `aliases` for a base `extension`.
 *
 *    trail.aliasExtension(".css", [".styl", ".less"]);
 **/
Hike.prototype.aliasExtension = function aliasExtension(extension, aliases) {
  // reset patterns cache
  this.__patterns__ = {};

  this.unaliasExtension(aliases);

  extension = normalizeExtensions(extension)[0];

  this.__aliases__[extension] = this.__aliases__[extension] || [];
  arrayAppend(this.__aliases__, extension, normalizeExtensions(aliases));
};

/**
 * Hike#unaliasExtension(aliases) -> void
 * - aliases (String, Array): alias or multiple aliases
 *
 * Unregisters `aliases`.
 *
 *    trail.unaliasExtension([".styl", ".less"]);
 **/
Hike.prototype.unaliasExtension = function unaliasExtension(aliases) {
  // reset patterns cache
  this.__patterns__ = {};

  aliases = normalizeExtensions(aliases);

  Object.keys(this.__aliases__).forEach(function (extension) {
    arrayRemove(this.__aliases__, extension, aliases);
  }, this);
};
