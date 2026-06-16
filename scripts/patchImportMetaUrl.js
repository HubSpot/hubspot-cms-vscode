'use strict';

// Webpack pre-loader applied to handleFieldsJS.js.
// Webpack replaces import.meta.url with the build machine's absolute file URL,
// which fails on Windows with "File URL path must be absolute" because the
// Unix-style path is not valid there. This loader swaps it for a runtime
// expression so the correct path is resolved on the user's machine.
module.exports = function (source) {
  // Only replace outside of comments — skip lines that contain // before the keyword.
  return source.replace(
    /^(?!.*\/\/.*import\.meta\.url)(.*)\bimport\.meta\.url\b/gm,
    (match, prefix) => prefix + "require('url').pathToFileURL(__filename).href"
  );
};
