# Mimoza

[![Build Status](https://img.shields.io/travis/nodeca/mimoza/master.svg?style=flat)](https://travis-ci.org/nodeca/mimoza)
[![NPM version](https://img.shields.io/npm/v/mimoza.svg?style=flat)](https://www.npmjs.org/package/mimoza)
[![Coverage Status](https://img.shields.io/coveralls/nodeca/mimoza/master.svg?style=flat)](https://coveralls.io/r/nodeca/mimoza?branch=master)


Mimoza is a tiny but comprehensive MIME tools library. Features:

- Resolving mime type by file path/name/extention (with fallback
  for unknown cases).
- Finding file extention by mime type.
- Checking if mime type (or file) can be compressed.
- Checking if mime type has text content (if you wish to force UTF-8 encoding)
- You can have multimple instances with different configs.
- Works in browser too (AMD module).

See detailed [API docs](http://nodeca.github.com/mimoza).

## Installation

for node.js:

```bash
npm install mimoza
```

for browser (AMD module):

```bash
bower install mimoza
```

## Example

``` javascript
var Mimoza = require('mimoza');

// Use builtin methods:

Mimoza.getExtension('audio/ogg');       // -> '.oga'

Mimoza.getMimeType('ogg');              // -> 'audio/ogg'
Mimoza.getMimeType('.oga');             // -> 'audio/ogg'
Mimoza.getMimeType('test.oga');         // -> 'audio/ogg'
Mimoza.getMimeType('foo/bar.oga');      // -> 'audio/ogg'

Mimoza.isCompressible('text/html');                // -> true
Mimoza.isCompressible('application/octet-stream'); // -> false

Mimoza.isText('text/html');                // -> true
Mimoza.isText('application/javascript');   // -> true
Mimoza.isText('application/json');         // -> true
Mimoza.isText('application/octet-stream'); // -> false


// Define your own instance

var mime = new Mimoza({
  defaultType: 'hard/core', // mime type for unknown extentions
  preloaded: true           // load default rules
});

// instances are customizeable
mime.register('foo/bar', ['baz', 'moo']);

mime.getExtension('foo/bar');           // -> '.baz'
mime.getMimeType('baz');                // -> 'foo/bar'
mime.getMimeType('moo');                // -> 'foo/bar'

// unknown file types, with default & custom fallback
mime.getMimeType('tada');               // -> 'hard/core'
mime.getMimeType('tada', 'soft/core');  // -> 'soft/core'
```
