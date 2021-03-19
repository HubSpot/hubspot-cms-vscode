const vscode = require('vscode');
const { validateHubl } = require('@hubspot/cli-lib/api/validate');
const { getPortalId } = require('@hubspot/cli-lib');
const { errors, WORD_REGEX } = require('./constants');

const getRange = (document, error) => {
  if (error.startPosition > 0) {
    return document.getWordRangeAtPosition(
      new vscode.Position(error.lineno - 1, error.startPosition - 1),
      WORD_REGEX
    );
  } else {
    return document.lineAt(new vscode.Position(error.lineno - 1, 0)).range;
  }
};

async function updateDiagnostics(document, collection) {
  if (!document) {
    return collection.clear();
  }

  const { renderingErrors } = await validateHubl(
    getPortalId(),
    document.getText()
  );

  const fitleredErrors = renderingErrors.filter((error) => {
    return error.reason != errors.MISSING;
  });

  const templateErrors = fitleredErrors.map((error) => {
    return {
      code: '',
      message: error.message,
      range: getRange(document, error),
      severity: vscode.DiagnosticSeverity.Error,
    };
  });

  collection.set(document.uri, templateErrors);
}

const collection = vscode.languages.createDiagnosticCollection('hubl');
let documentChangeListener;

const enableLinting = () => {
  let timeout = null;

  if (vscode.window.activeTextEditor) {
    updateDiagnostics(vscode.window.activeTextEditor.document, collection);
  }

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

const disableLinting = () => {
  // Clear out any existing diagnostics
  collection.clear();
  // Remove onDidChangeTextDocument event listener
  documentChangeListener.dispose();
};

module.exports = { enableLinting, disableLinting };
