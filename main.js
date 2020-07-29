const vscode = require('vscode');

/**
 * @param {vscode.ExtensionContext} context
 */
function activate() {
  vscode.languages.setLanguageConfiguration('html', {
		indentationRules: {
			decreaseIndentPattern: /.*{%(.*?end).*%}*./,
			increaseIndentPattern: /.*{%(?!.*end).*%}.*/
    }
  });
}

function deactivate() {}

// eslint-disable-next-line no-undef
module.exports = {
	activate,
	deactivate
}
