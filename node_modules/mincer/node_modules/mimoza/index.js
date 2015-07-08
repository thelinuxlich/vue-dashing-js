'use strict';


// mime files data
var db = require('mime-db');


// Merge objects
//
function assign(obj /*from1, from2, from3, ...*/) {
  var sources = Array.prototype.slice.call(arguments, 1);

  sources.forEach(function (source) {
    Object.keys(source).forEach(function (key) {
      obj[key] = source[key];
    });
  });

  return obj;
}


// leaves only extension from the given string
//   normalize('foo/bar.js')  // -> '.js'
//   normalize('bar.js')      // -> '.js'
//   normalize('.js')         // -> '.js'
//   normalize('js')          // -> '.js'
function normalize(path) {
  // edge case: '/txt' & '\txt' are not resolveable
  if (/[\\/][^\\/.]+$/.test(path)) { return ''; }

  return '.' + path.replace(/.*[\.\/\\]/, '').toLowerCase();
}

// Remove charset/types/spaces, convenent for external data check
// " tExt/htMl ; charset=UTF-8 ; type=foo " -> "text/html"
function clearMime(mimeType) {
  if (!mimeType || (String(mimeType) !== mimeType)) { return ''; }
  return mimeType.split(';')[0].trim().toLowerCase();
}


/**
 * class Mimoza
 **/

/**
 *  new Mimoza([options])
 *
 *  Initiates new instance of Mimoza.
 *
 *  ##### Options
 *
 *  - **defaultType** _(String):_ Default mime type used as last-resort
 *    for [[Mimoza#getMimeType]]. By default: `undefined`.
 *  - **preloaded** _(Boolean):_ Init instance with default mime rules
 **/
var Mimoza = module.exports = function Mimoza(options) {
  options = options || {};

  // Map of `extension -> mimeType` pairs.
  Object.defineProperty(this, 'types',          { value: Object.create(null) });

  // Map of `mimeType -> extensions` pairs.
  Object.defineProperty(this, 'extensions',     { value: Object.create(null) });

  // Used as last-resort for [[Mimoza#getMimeType]].
  Object.defineProperty(this, 'defaultType',    { value: options.defaultType });


  if (options.preloaded) {
    Object.keys(db).forEach(function (mime) {
      var val = db[mime];

      if (val.extensions) {
        this.register(mime, val.extensions);
      }
    }, this);
  }
};


/**
 *  Mimoza#clone() -> Object
 *
 *  Creates copy of current Mimoza instanse
 **/
Mimoza.prototype.clone = function clone() {
  var m = new Mimoza({ defaultType: this.defaultType });

  assign(m.types, this.types);
  assign(m.extensions, this.extensions);

  return m;
};


/**
 *  Mimoza#register(mimeType, extensions[, overrideDefault = false]) -> Void
 *  - mimeType (String):
 *  - extensions (String|Array):
 *  - overrideDefault (Boolean):
 *
 *  Register given `extensions` as representatives of `mimeType` and register
 *  first element of `extensions` as default extension for the `mimeType`.
 *
 *
 *  ##### Example
 *
 *  ```javascript
 *  mime.register('audio/ogg', ['oga', 'ogg', 'spx']);
 *
 *  mime.getMimeType('.oga');       // -> 'audio/ogg'
 *  mime.getMimeType('.ogg');       // -> 'audio/ogg'
 *  mime.getExtension('audio/ogg'); // -> '.oga'
 *  ```
 *
 *  ##### Overriding default extension
 *
 *  `mimeType -> extension` is set only once, if you wnt to override it,
 *  pass `overrideDefault` flag as true. See example below:
 *
 *  ```javascript
 *  mime.register('audio/ogg', ['oga']);
 *  mime.getExtension('audio/ogg');
 *  // -> '.oga'
 *
 *  mime.register('audio/ogg', ['spx']);
 *  mime.getExtension('audio/ogg');
 *  // -> '.oga'
 *
 *  mime.register('audio/ogg', ['ogg'], true);
 *  mime.getExtension('audio/ogg');
 *  // -> '.ogg'
 *  ```
 **/
Mimoza.prototype.register = function register(mimeType, extensions, overrideDefault) {
  extensions = Array.isArray(extensions) ? extensions : [ extensions ];

  // pollute `extension -> mimeType` map
  extensions.forEach(function (ext) {
    this.types[normalize(ext)] = mimeType;
  }, this);

  // use case insensitive mime types for extention resolve
  if (overrideDefault || typeof this.extensions[mimeType.toLowerCase()] === 'undefined') {
    this.extensions[mimeType.toLowerCase()] = normalize(extensions[0]);
  }
};


/**
 *  Mimoza#getMimeType(path[, fallback]) -> String
 *
 *  Lookup a mime type based on extension
 **/
Mimoza.prototype.getMimeType = function getMimeType(path, fallback) {
  return this.types[normalize(path)] || fallback || this.defaultType;
};


/**
 *  Mimoza#getExtension(mimeType) -> String
 *
 *  Return file extension associated with a mime type.
 **/
Mimoza.prototype.getExtension = function getExtension(mimeType) {
  return this.extensions[clearMime(mimeType)];
};


// Returns whenever an asset is text or not
var TEXT_MIME_RE = new RegExp([
  '^text/',
  '/json$',
  '/javascript$'
].join('|'));

/**
 *  Mimoza#isText(mimeType) -> Boolean
 *
 *  Check if mime type provides text content. Can be used to add encoding.
 **/
Mimoza.prototype.isText = function isText(mimeType) {
  return TEXT_MIME_RE.test(clearMime(mimeType));
};


////////////////////////////////////////////////////////////////////////////////
//
// Public methods to work with module without creating new instance, if default
// configs are ok for you.
//


// builtin instance of mimoza
var builtin = new Mimoza({ preloaded: true });

/**
 *  Mimoza.getMimeType(path, fallback) -> String
 *
 *  Proxy to [[Mimoza#getMimeType]] of internal, built-in instance of [[Mimoza]]
 *  filled with some default types.
 **/
Mimoza.getMimeType = function _getMimeType(path, fallback) {
  return builtin.getMimeType(path, fallback);
};

/**
 *  Mimoza.getExtension(mimeType) -> String
 *
 *  Proxy to [[Mimoza#getExtension]] of internal, built-in instance of [[Mimoza]]
 *  filled with some default types.
 **/
Mimoza.getExtension = function _getExtension(mimeType) {
  return builtin.getExtension(mimeType);
};

/**
 *  Mimoza.isText(mimeType) -> Boolean
 *
 *  Proxy to [[Mimoza#isText]] of internal, built-in instance
 *  of [[Mimoza]].
 **/
Mimoza.isText = function _isText(mimeType) {
  return builtin.isText(mimeType);
};
