'use strict';

var fs    = require('fs');
var path  = require('path');

var ENOENT = 'ENOENT';

var SPECIAL_FILENAMES_RE = /^\.|~$|^#.*#$/;
function rejectSpecialFilenames(filename) {
  return !SPECIAL_FILENAMES_RE.test(filename);
}

// ENOENT-aware wraper over `fs.statSync`.
// Returns `undefined` if file does not exists.
module.exports.stat = function stat(pathname) {
  try {
    return fs.statSync(pathname);
  } catch (err) {
    if (ENOENT !== err.code) {
      throw err;
    }
  }
};

// Version of `fs.readdirSync` that filters out `.` files and
// `~` swap files. Returns an empty `Array` if the directory
// does not exist.
module.exports.entries = function entries(pathname) {
  try {
    return fs.readdirSync(pathname || '').filter(rejectSpecialFilenames).sort();
  } catch (err) {
    if (ENOENT !== err.code) {
      throw err;
    }

    return [];
  }
};

// Used to escape RegExp special chars.
// See [[escapeRegexp]]
var REGEXP_SPECIAL_CHARS_RE = /([.?*+{}()\[\]])/g;

// Used to determine whenever pathname is relative or not.
var RELATIVE_PATHNAME_RE = /^\.\.?\//;

// Returns string with RegExp special chars being escaped.
function escapeRegexp(str) {
  return str.replace(REGEXP_SPECIAL_CHARS_RE, '\\$1');
}

// Returns true if `dirname` is a subdirectory of any of the `paths`
function containsPath(self, dirname) {
  return self.__paths__.some(function(p) {
    return p === dirname.substr(0, p.length);
  });
}

// Returns a `Regexp` that matches the allowed extensions.
//
//     patternFor(self, "index.html");
//     // => /^index(?:.html|.htm)(?:.builder|.erb)*$/
function patternFor(self, basename) {
  if (!self.__patterns__[basename]) {
    var pattern;

    var extname = path.extname(basename);
    var aliases = self.__aliases__[extname];

    if (!aliases || !aliases.length) {
      pattern  = escapeRegexp(basename);
    } else {
      basename = path.basename(basename, extname);
      pattern  = escapeRegexp(basename) +
        '(?:' + [ extname ].concat(aliases).map(escapeRegexp).join('|') + ')';
    }

    pattern += '(?:' + self.__extensions__.map(escapeRegexp).join('|') + ')*';
    self.__patterns__[basename] = new RegExp('^' + pattern + '$');
  }

  return self.__patterns__[basename];
}

// Sorts candidate matches by their extension priority.
// Extensions in the front of the `extensions` carry more weight.
function sortMatches(self, matches, basename) {
  var aliases = self.__aliases__[path.extname(basename)] || [];
  var weights = {};

  matches.forEach(function(match) {
    // XXX: this doesn't work well with aliases
    //      i.e. entry=index.php, extnames=index.html
    var extnames = match.replace(basename, '').split('.');

    weights[match] = extnames.reduce(function(sum, ext) {
      if (!ext) {
        return sum;
      }

      ext = '.' + ext;

      if (self.__extensions__.indexOf(ext) >= 0) {
        return sum + self.__extensions__.indexOf(ext) + 1;
      }

      if (aliases.indexOf(ext) >= 0) {
        return sum + aliases.indexOf(ext) + 11;
      }

      return sum;
    }, 0);
  });

  return matches.sort(function(a, b) {
    return weights[a] > weights[b] ? 1 : -1;
  });
}

// Checks if the path is actually on the file system and performs
// any syscalls if necessary.
function match(self, dirname, basename, callback) {
  var pathname, stats, pattern, matches;

  pattern = patternFor(self, basename);
  matches = self.entries(dirname).filter(function(m) { return pattern.test(m); });
  matches = sortMatches(self, matches, basename);

  while (matches.length) {
    pathname  = path.join(dirname, matches.shift());
    stats     = self.stat(pathname);

    if (stats && stats.isFile() && callback(pathname)) {
      return pathname;
    }
  }
}

function findInBasePath(self, logicalPath, basePath, callback) {
  var candidate = path.resolve(basePath, logicalPath);
  var dirname   = path.dirname(candidate);
  var basename  = path.basename(candidate);

  if (containsPath(self, dirname)) {
    return match(self, dirname, basename, callback);
  }
}

function findInPaths(self, logicalPath, callback) {
  var i, result;
  var dirname  = path.dirname(logicalPath);
  var basename = path.basename(logicalPath);

  for (i = 0; i < self.__paths__.length; i++) {
    result = match(self, path.resolve(self.__paths__[i], dirname), basename, callback);

    if (result) {
      return result;
    }
  }
}

// Returns the expanded path for a logical path in the path collection.
module.exports.find = function find(logicalPaths, options, callback) {
  var basePath, logicalPath, pathname;

  if (typeof options === 'function') {
    callback  = options;
    options         = {};
  }

  if (!callback) {
    callback = function () { return true; };
  }

  basePath      = (options && options.basePath) || this.__root__;
  logicalPaths  = Array.isArray(logicalPaths) ? logicalPaths.slice() : [ logicalPaths ];

  while (logicalPaths.length) {
    logicalPath = logicalPaths.shift().replace(/^\//, '');

    if (RELATIVE_PATHNAME_RE.test(logicalPath)) {
      pathname = findInBasePath(this, logicalPath, basePath, callback);
    } else {
      pathname = findInPaths(this, logicalPath, callback);
    }

    if (pathname) {
      return pathname;
    }
  }
};
