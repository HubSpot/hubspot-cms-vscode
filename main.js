const vscode = require('vscode');

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {

const alertUser = (textDocument, lineNumber) => {
	const buttonLabel = 'Switch this language to HubL';
	const languageId = 'hubl';

	vscode.window
	.showInformationMessage(
		`HubL detected  on line ${lineNumber}`,
		buttonLabel
	)
	.then((selection) => {
		if (selection === buttonLabel) {
			vscode.languages.setTextDocumentLanguage(textDocument, 'html');
		}
	});
}

  context.subscriptions.push(
    vscode.workspace.onDidOpenTextDocument(() => {
			const textDocument = vscode.window.activeTextEditor.document;

			let n = 1;
			while (n < 50 && n <= textDocument.lineCount) {
				const lineWithHubl = textDocument.lineAt(n).text.match(/{{.*}}|{%.*%}/g);

        if (lineWithHubl) {

          alertUser(textDocument, n);
          break;
        }
        n++;
      }
    })
  );
}

function deactivate() {}

// eslint-disable-next-line no-undef
module.exports = {
  activate,
  deactivate,
};
