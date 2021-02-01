const { validateHubl } = require('@hubspot/cms-lib/api/validate');
const { getPortalId } = require('@hubspot/cms-lib');
const vscode = require('vscode');

const getRange = (document, error) => {
  if (error.startPosition > 0) {
    return document.getWordRangeAtPosition(
      new vscode.Position(error.lineno - 1, error.startPosition - 1)
    );
  } else {
    return document.lineAt(new vscode.Position(error.lineno - 1, 0)).range;
  }
};

async function updateDiagnostics(document, collection) {
  console.log('request');
  const { renderingErrors } = await validateHubl(
    getPortalId(),
    document.getText()
  );

  const errors = renderingErrors.map((error) => {
    return {
      code: '',
      message: error.message,
      range: getRange(document, error),
      severity: vscode.DiagnosticSeverity.Error,
    };
  });

  if (document) {
    collection.set(document.uri, errors);
  } else {
    collection.clear();
  }
}

const collection = vscode.languages.createDiagnosticCollection('hubl');
let documentChangeListener;

// if (vscode.window.activeTextEditor) {
//   updateDiagnostics(vscode.window.activeTextEditor.document, collection);
// }

const lintHubl = () => {
  console.log('lint');
  let timeout = null;

  documentChangeListener = vscode.workspace.onDidChangeTextDocument(
    (editor) => {
      if (editor) {
        clearTimeout(timeout);
        timeout = setTimeout(function () {
          updateDiagnostics(editor.document, collection);
        }, 1000);
      }
    }
  );
};

const disable = () => {
  // Clear out any existing diagnostics
  collection.clear();
  // Remove onDidChangeTextDocument event listener
  documentChangeListener.dispose();
};

module.exports = { lintHubl, disable };
