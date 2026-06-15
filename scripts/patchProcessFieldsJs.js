'use strict';

// Webpack pre-loader applied to processFieldsJs.js.
// Without this, webpack transforms import() into its own async chunk loader,
// which breaks loading of arbitrary user-supplied ESM fields.js files.
// webpackIgnore tells webpack to leave this import() as a native Node.js call.
module.exports = function (source) {
  return source.replace(
    /\bawait import\(/g,
    'await import(/* webpackIgnore: true */'
  );
};
