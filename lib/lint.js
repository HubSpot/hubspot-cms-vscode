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
  console.log('request')
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

const lintHubl = (context) => {
  const collection = vscode.languages.createDiagnosticCollection('hubl');

  if (vscode.window.activeTextEditor) {
    updateDiagnostics(vscode.window.activeTextEditor.document, collection);
  }
  let timeout = null;
  context.subscriptions.push(
    vscode.workspace.onDidChangeTextDocument((editor) => {
      if (editor) {
        clearTimeout(timeout);
        timeout = setTimeout(function () {
          updateDiagnostics(editor.document, collection);
        }, 1000);
      }
    })
  );
};

module.exports = { lintHubl };
