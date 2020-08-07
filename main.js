const vscode = require('vscode');

/**
 * @param {vscode.ExtensionContext} context
 */
function activate() {
  vscode.languages.setLanguageConfiguration('html', {
    indentationRules: {
      decreaseIndentPattern: /.*{%(.*?end).*%}*./,
      increaseIndentPattern: /.*{%(?!.*end).*%}.*/,
    },
	});

	const override = {
		"textMateRules": [
			{
				"scope": [
					"meta.scope.hubl.variable",
					"variable"
				],
				"settings": {
					"foreground": "#e7ca6b"
				}
			}
		]
	};

	vscode.workspace.onDidChangeConfiguration(e => {
		if (e.affectsConfiguration('hubl.overrideSyntaxHighlight')) {
			let hublConfig = vscode.workspace.getConfiguration('hubl');
			let editorConfig = vscode.workspace.getConfiguration('editor');

			if (hublConfig.get('overrideSyntaxHighlight') === true){
				vscode.window.showInformationMessage('Override HubL Syntax On');
				editorConfig.update('tokenColorCustomizations', override);
			} else {
				vscode.window.showInformationMessage('Override HubL Syntax Off');
				editorConfig.update('tokenColorCustomizations', undefined);
			}
		}
	});
}

function deactivate() {}

// eslint-disable-next-line no-undef
module.exports = {
  activate,
  deactivate,
};
