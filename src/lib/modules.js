// Matches files named module.html
const MODULE_HTML_EXTENSION_REGEX = new RegExp(/\.module\/module\.html$/);

/**
 * Checks if the given path points to an .html file within a .module folder
 * @param {string} filePath
 * @returns {boolean}
 */
const isModuleHTMLFile = (filePath) =>
  MODULE_HTML_EXTENSION_REGEX.test(filePath);

export { isModuleHTMLFile };
